import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SettingsService } from './settings.service.js';
import { AdminSettingsController } from './controllers/admin-settings.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [AdminSettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
