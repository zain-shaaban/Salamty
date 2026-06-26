import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MAIL_QUEUE } from '../queues/queue-names.const.js';

export interface OtpMailJob {
  to: string;
  username: string;
  otp: string;
}

export interface WelcomeMailJob {
  to: string;
  username: string;
}

export interface BroadcastMailJob {
  to: string;
  username: string;
  title: string;
  body: string;
}

const JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 3000 },
  removeOnComplete: true,
  removeOnFail: 50,
};

@Injectable()
export class MailService {
  constructor(@InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue) {}

  async queueOtpEmail(data: OtpMailJob): Promise<void> {
    await this.mailQueue.add('send-otp', data, JOB_OPTIONS);
  }

  async queueWelcomeEmail(data: WelcomeMailJob): Promise<void> {
    await this.mailQueue.add('send-welcome', data, JOB_OPTIONS);
  }

  async queueBroadcastEmail(
    data: BroadcastMailJob,
    delayMs = 0,
  ): Promise<void> {
    await this.mailQueue.add('send-broadcast', data, {
      ...JOB_OPTIONS,
      delay: delayMs,
    });
  }
}
