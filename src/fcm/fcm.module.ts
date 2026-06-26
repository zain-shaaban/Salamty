import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  initializeApp,
  getApps,
  cert,
  ServiceAccount,
} from 'firebase-admin/app';
import { NOTIFICATION_QUEUE } from '../queues/queue-names.const.js';
import { FcmService } from './fcm.service.js';
import { FcmProcessor, FIREBASE_APP } from './processors/fcm.processor.js';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
  ],
  providers: [
    {
      provide: FIREBASE_APP,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        if (getApps().length > 0) return getApps()[0];

        return initializeApp({
          credential: cert(
            JSON.parse(
              config.getOrThrow<string>('FIREBASE_SERVICE_ACCOUNT'),
            ) as ServiceAccount,
          ),
        });
      },
    },
    FcmService,
    FcmProcessor,
  ],
  exports: [FcmService],
})
export class FcmModule {}
