import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { MAIL_QUEUE } from '../queues/queue-names.const.js';
import { MailService } from './mail.service.js';
import { MailProcessor } from './processors/mail.processor.js';

@Module({
  imports: [ConfigModule, BullModule.registerQueue({ name: MAIL_QUEUE })],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
