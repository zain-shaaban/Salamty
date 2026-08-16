import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GroupEventsGateway } from '../realtime/gateways/group-events.gateway.js';
import { hashSecretKey } from '../auth/utils/secret-key.util.js';
import { CreateGroupDto } from './dto/requests/create-group.dto.js';
import { AddUserToGroupDto } from './dto/requests/add-user-to-group.dto.js';
import { LeaveGroupDto } from './dto/requests/leave-group.dto.js';

@Injectable()
export class GroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupEvents: GroupEventsGateway,
  ) {}

  async createNewGroup({ groupName }: CreateGroupDto, userId: string) {
    const group = await this.prisma.group.create({
      data: {
        groupName,
        createdBy: { connect: { id: userId } },
        groupMembers: { create: { userId } },
      },
      select: { id: true },
    });

    await this.groupEvents.addUserToGroup(userId, group.id);

    return { groupId: group.id };
  }

  async addUserToGroup(
    { groupId, secretKey }: AddUserToGroupDto,
    userId: string,
  ) {
    const group = await this.prisma.group.findFirst({
      where: {
        id: groupId,
        groupMembers: { some: { userId } },
      },
      select: { id: true },
    });

    if (!group) {
      throw new NotFoundException(
        'The group does not exist or access is denied',
      );
    }

    const user = await this.prisma.user.findFirst({
      where: { secretKey: hashSecretKey(secretKey) },
      select: { id: true, username: true, confirmed: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.confirmed) {
      throw new BadRequestException('User email is not verified');
    }

    await this.prisma.groupMember.upsert({
      where: { userId_groupId: { userId: user.id, groupId } },
      create: { userId: user.id, groupId },
      update: {},
    });

    await this.groupEvents.addUserToGroup(user.id, groupId);
    this.groupEvents.notifyGroupChanged(groupId);

    return { id: user.id, username: user.username };
  }

  async leaveGroup({ groupId }: LeaveGroupDto, userId: string): Promise<null> {
    const { count } = await this.prisma.groupMember.deleteMany({
      where: { userId, groupId },
    });

    if (count === 0) {
      throw new NotFoundException('Group not found');
    }

    this.groupEvents.removeUserFromGroup(userId, groupId);

    const remainingMembers = await this.prisma.groupMember.count({
      where: { groupId },
    });

    if (remainingMembers === 0) {
      await this.prisma.group.delete({ where: { id: groupId } });
    } else {
      this.groupEvents.notifyGroupChanged(groupId);
    }

    return null;
  }

  async getGroups(userId: string) {
    const groups = await this.prisma.group.findMany({
      where: {
        groupMembers: { some: { userId } },
      },
      select: {
        id: true,
        groupName: true,
        createdById: true,
        groupMembers: {
          select: {
            user: { select: { id: true, username: true } },
          },
        },
      },
    });

    return groups.map((group) => ({
      id: group.id,
      groupName: group.groupName,
      createdById: group.createdById,
      members: group.groupMembers.map((member) => ({
        id: member.user.id,
        username: member.user.username,
      })),
    }));
  }
}
