import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import type { App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { NOTIFICATION_QUEUE } from '../../queues/queue-names.const.js';
import type { PushNotificationJob } from '../fcm.service.js';

export const FIREBASE_APP = 'FIREBASE_APP';

@Processor(NOTIFICATION_QUEUE)
export class FcmProcessor extends WorkerHost {
  private readonly logger = new Logger(FcmProcessor.name);

  constructor(@Inject(FIREBASE_APP) private readonly firebaseApp: App) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name !== 'send-push') {
      this.logger.warn(`Unknown notification job: ${job.name}`);
      return;
    }

    const { token, title, body, data } = job.data as PushNotificationJob;

    if (!token) {
      this.logger.warn(
        `Skipping push notification — no device token (job ${job.id})`,
      );
      return;
    }

    await getMessaging(this.firebaseApp).send({
      token,
      notification: { title, body },
      data,
    });

    this.logger.log(`Push notification sent (job ${job.id})`);
  }
}
