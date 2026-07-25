import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { GroupService } from './group.service.js';
import { GroupController } from './controllers/group.controller.js';

@Module({
  imports: [PrismaModule, RealtimeModule],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
