import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { QueuesModule } from './queues/queues.module.js';
import { MailModule } from './mail/mail.module.js';
import { FcmModule } from './fcm/fcm.module.js';
import { GroupModule } from './group/group.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: { colorize: true, singleLine: true },
              }
            : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        redact: ['req.headers.authorization'],
      },
    }),
    QueuesModule,
    PrismaModule,
    MailModule,
    FcmModule,
    AuthModule,
    SettingsModule,
    GroupModule,
  ],
  controllers: [AppController],
  providers: [
    // Global JWT guard — all routes protected by default; use @Public() to opt-out
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global roles guard — use @Roles(Role.ADMIN) to restrict
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
