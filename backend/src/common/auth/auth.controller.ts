import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { DeviceId } from './decorators/device-id.decorator.js';
import { LocalService } from './local/local.service.js';
import { OtpService } from './otp/otp.service.js';
import { ResetPasswordService } from './reset-password/reset-password.service.js';
import { GoogleService } from './google/google.service.js';
import { LinkedinService } from './linkedin/linkedin.service.js';
import { MeService } from './me/me.service.js';
import { ChangePasswordService } from './change-password/change-password.service.js';
import { RegisterDto } from './local/dto/register.dto.js';
import { LoginDto } from './local/dto/login.dto.js';
import { SendOtpDto } from './otp/dto/send-otp.dto.js';
import { VerifyOtpDto } from './otp/dto/verify-otp.dto.js';
import { ForgotPasswordDto } from './reset-password/dto/forgot-password.dto.js';
import { VerifyResetCodeDto } from './reset-password/dto/verify-reset-code.dto.js';
import { ResetPasswordDto } from './reset-password/dto/reset-password.dto.js';
import { GoogleAuthDto } from './google/dto/google-auth.dto.js';
import { LinkedinAuthDto } from './linkedin/dto/linkedin-auth.dto.js';
import { ChangePasswordDto } from './change-password/dto/change-password.dto.js';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly localService: LocalService,
    private readonly otpService: OtpService,
    private readonly resetPasswordService: ResetPasswordService,
    private readonly googleService: GoogleService,
    private readonly linkedinService: LinkedinService,
    private readonly meService: MeService,
    private readonly changePasswordService: ChangePasswordService,
  ) {}

  @Get('signup-status')
  signupStatus() {
    return this.localService.signupStatus();
  }

  @Post('register')
  register(@Body() dto: RegisterDto, @Ip() ip: string, @DeviceId() deviceId: string) {
    return this.localService.register(dto, { ip, deviceId });
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto, @Ip() ip: string, @Headers('user-agent') userAgent?: string) {
    return this.localService.login(dto, { ip, userAgent });
  }

  @HttpCode(HttpStatus.OK)
  @Post('send-otp')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.otpService.sendEmailVerification(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto, @Ip() ip: string, @Headers('user-agent') userAgent?: string) {
    return this.otpService.verifyEmail(dto, { ip, userAgent });
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.resetPasswordService.forgotPassword(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-reset-code')
  verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    return this.resetPasswordService.verifyResetCode(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.resetPasswordService.resetPassword(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('google')
  google(
    @Body() dto: GoogleAuthDto,
    @Ip() ip: string,
    @DeviceId() deviceId: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.googleService.authenticate(dto, { ip, userAgent, deviceId });
  }

  @HttpCode(HttpStatus.OK)
  @Post('linkedin')
  linkedin(
    @Body() dto: LinkedinAuthDto,
    @Ip() ip: string,
    @DeviceId() deviceId: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.linkedinService.authenticate(dto, { ip, userAgent, deviceId });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser('sub') userId: string) {
    return this.meService.getMe(userId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  changePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.changePasswordService.changePassword(userId, dto, { ip, userAgent });
  }
}
