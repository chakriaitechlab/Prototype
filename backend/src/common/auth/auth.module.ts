import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { TokenService } from './token/token.service.js';
import { MeService } from './me/me.service.js';
import { OtpService } from './otp/otp.service.js';
import { LocalService } from './local/local.service.js';
import { ResetPasswordService } from './reset-password/reset-password.service.js';
import { GoogleService } from './google/google.service.js';
import { LinkedinService } from './linkedin/linkedin.service.js';
import { ChangePasswordService } from './change-password/change-password.service.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', '7d') as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtAuthGuard,
    RolesGuard,
    TokenService,
    MeService,
    OtpService,
    LocalService,
    ResetPasswordService,
    GoogleService,
    LinkedinService,
    ChangePasswordService,
  ],
  exports: [JwtModule, JwtAuthGuard, RolesGuard, MeService, OtpService],
})
export class AuthModule {}
