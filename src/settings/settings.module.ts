import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SettingsService } from './settings.service.js';
import { AdminSettingsController } from './controllers/admin-settings.controller.js';
import { SettingsController } from './controllers/settings.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [SettingsController, AdminSettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
