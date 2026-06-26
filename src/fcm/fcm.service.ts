import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NOTIFICATION_QUEUE } from '../queues/queue-names.const.js';

export interface PushNotificationJob {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

const JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 3000 },
  removeOnComplete: true,
  removeOnFail: 50,
};

@Injectable()
export class FcmService {
  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private readonly notificationQueue: Queue,
  ) {}

  async queuePushNotification(job: PushNotificationJob): Promise<void> {
    if (!job.token) return;
    await this.notificationQueue.add('send-push', job, JOB_OPTIONS);
  }

  async queuePushToMany(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const validTokens = tokens.filter(Boolean);
    if (!validTokens.length) return;

    const jobs = validTokens.map((token) => ({
      name: 'send-push',
      data: { token, title, body, data },
      opts: JOB_OPTIONS,
    }));

    await this.notificationQueue.addBulk(jobs);
  }
}
