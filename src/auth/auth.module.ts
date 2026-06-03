import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service.js';
import { OtpService } from './services/otp.service.js';
import { SessionService } from './services/session.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { AdminAuthController } from './controllers/admin-auth.controller.js';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d') as any,
        },
      }),
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AuthService, OtpService, SessionService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
