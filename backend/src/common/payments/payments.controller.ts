import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { PaymentsService } from './payments.service.js';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER', 'RECRUITER')
  @Post('checkout')
  checkout(@CurrentUser() user: AuthenticatedUser, @Body() dto: CheckoutDto) {
    return this.payments.checkout(user, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER', 'RECRUITER')
  @Get('history')
  history(@CurrentUser('sub') userId: string) {
    return this.payments.history(userId);
  }

  @Post('success')
  async success(
    @Body('tran_id') tranId: string | undefined,
    @Body('val_id') valId: string | undefined,
    @Res() res: Response,
  ) {
    res.redirect(HttpStatus.SEE_OTHER, await this.payments.handleSuccess(tranId, valId));
  }

  @Post('fail')
  async fail(@Body('tran_id') tranId: string | undefined, @Res() res: Response) {
    res.redirect(HttpStatus.SEE_OTHER, await this.payments.handleClosed(tranId, 'FAILED'));
  }

  @Post('cancel')
  async cancel(@Body('tran_id') tranId: string | undefined, @Res() res: Response) {
    res.redirect(HttpStatus.SEE_OTHER, await this.payments.handleClosed(tranId, 'CANCELLED'));
  }

  @Post('ipn')
  @HttpCode(HttpStatus.OK)
  ipn(@Body('val_id') valId: string | undefined) {
    return this.payments.handleIpn(valId);
  }
}
