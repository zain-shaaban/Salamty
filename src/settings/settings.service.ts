import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateAppConfigDto } from './dto/requests/update-app-config.dto.js';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateAppConfig(dto: UpdateAppConfigDto) {
    const data = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    );

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const existing = await this.prisma.appConfig.findFirst();
    if (!existing) {
      throw new NotFoundException('App config not found');
    }

    return this.prisma.appConfig.update({
      where: { id: existing.id },
      data,
    });
  }
}
