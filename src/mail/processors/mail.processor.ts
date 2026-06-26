import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';
import { MAIL_QUEUE } from '../../queues/queue-names.const.js';
import {
  otpEmailTemplate,
  otpEmailText,
  welcomeEmailTemplate,
  welcomeEmailText,
  broadcastEmailTemplate,
  broadcastEmailText,
} from '../templates';
import type {
  OtpMailJob,
  WelcomeMailJob,
  BroadcastMailJob,
} from '../mail.service.js';

const BROADCAST_SUBJECT = 'Salamty - App Notification';

@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.fromAddress = `"Salamty" <${this.configService.getOrThrow<string>('MAIL_USER')}>`;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.getOrThrow<string>('MAIL_USER'),
        pass: this.configService.getOrThrow<string>('MAIL_PASSWORD'),
      },
    });
  }

  async process(job: Job): Promise<void> {
    this.logger.debug(`Processing mail job [${job.name}] id=${job.id}`);

    switch (job.name) {
      case 'send-otp':
        await this.sendOtp(job.data as OtpMailJob);
        break;
      case 'send-welcome':
        await this.sendWelcome(job.data as WelcomeMailJob);
        break;
      case 'send-broadcast':
        await this.sendBroadcast(job.data as BroadcastMailJob);
        break;
      default:
        this.logger.warn(`Unknown mail job name: ${job.name}`);
    }
  }

  private async sendOtp(data: OtpMailJob): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: data.to,
      subject: 'Salamty - Verification Code',
      text: otpEmailText(data.username, data.otp),
      html: otpEmailTemplate(data.username, data.otp),
    });
    this.logger.log(`OTP email sent to ${data.to}`);
  }

  private async sendWelcome(data: WelcomeMailJob): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: data.to,
      subject: 'Salamty - Account Verified',
      text: welcomeEmailText(data.username),
      html: welcomeEmailTemplate(data.username),
    });
    this.logger.log(`Welcome email sent to ${data.to}`);
  }

  private async sendBroadcast(data: BroadcastMailJob): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: data.to,
      subject: BROADCAST_SUBJECT,
      text: broadcastEmailText(data.username, data.title, data.body),
      html: broadcastEmailTemplate(data.username, data.title, data.body),
    });
    this.logger.log(`Broadcast email sent to ${data.to}`);
  }
}
