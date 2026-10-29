import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import type { PaymentStatus, Role } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { SslcommerzService } from '../../infrastructure/sslcommerz/sslcommerz.service.js';
import type { AuthenticatedUser } from '../auth/guards/jwt-auth.guard.js';
import { DiamondsService, type PayingRole } from '../diamonds/diamonds.service.js';
import { CheckoutDto, PAID_PLAN_IDS, type PaidPlanId } from './dto/checkout.dto.js';

const CURRENCY = 'BDT';
const HISTORY_LIMIT = 50;
const TRAN_ID_PREFIX = 'CHK';
const FALLBACK_PHONE = '01700000000';

type PaymentResult = 'success' | 'failed' | 'cancelled';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly apiPublicUrl: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sslcommerz: SslcommerzService,
    private readonly diamonds: DiamondsService,
    configService: ConfigService,
  ) {
    this.apiPublicUrl = configService.get<string>('API_PUBLIC_URL', 'http://localhost:8000').replace(/\/$/, '');
    this.frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000').replace(/\/$/, '');
  }

  async checkout(user: AuthenticatedUser, dto: CheckoutDto) {
    const { planId } = dto;
    const plan = this.diamonds.paidPlan(this.payingRole(user.role), planId);

    const customer = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { name: true, email: true, phoneNumber: true },
    });
    if (!customer) throw new NotFoundException('User not found');

    const payment = await this.prisma.payment.create({
      data: {
        userId: user.sub,
        tranId: `${TRAN_ID_PREFIX}${Date.now()}${randomBytes(4).toString('hex').toUpperCase()}`,
        planId,
        amount: plan.price,
        currency: CURRENCY,
      },
    });

    try {
      const gatewayUrl = await this.sslcommerz.createSession({
        tranId: payment.tranId,
        amount: payment.amount,
        currency: payment.currency,
        productName: `Chakri.ai ${plan.name} plan`,
        customer: {
          name: customer.name || customer.email,
          email: customer.email,
          phone: customer.phoneNumber || FALLBACK_PHONE,
        },
        successUrl: `${this.apiPublicUrl}/api/payments/success`,
        failUrl: `${this.apiPublicUrl}/api/payments/fail`,
        cancelUrl: `${this.apiPublicUrl}/api/payments/cancel`,
        ipnUrl: `${this.apiPublicUrl}/api/payments/ipn`,
      });
      return { gatewayUrl };
    } catch (err) {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
      throw err;
    }
  }

  async history(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_LIMIT,
      select: {
        id: true,
        tranId: true,
        planId: true,
        amount: true,
        currency: true,
        status: true,
        method: true,
        createdAt: true,
        paidAt: true,
      },
    });

    return { payments };
  }

  async handleSuccess(tranId: string | undefined, valId: string | undefined) {
    const paid = valId ? await this.confirm(valId) : false;
    return this.redirectUrl(tranId, paid ? 'success' : 'failed');
  }

  async handleClosed(tranId: string | undefined, status: Extract<PaymentStatus, 'FAILED' | 'CANCELLED'>) {
    if (tranId) {
      await this.prisma.payment.updateMany({ where: { tranId, status: 'PENDING' }, data: { status } });
    }
    return this.redirectUrl(tranId, status === 'CANCELLED' ? 'cancelled' : 'failed');
  }

  async handleIpn(valId: string | undefined) {
    const paid = valId ? await this.confirm(valId) : false;
    return { received: true, paid };
  }

  private async confirm(valId: string) {
    const validation = await this.sslcommerz.validate(valId);
    if (!validation) return false;

    const payment = await this.prisma.payment.findUnique({
      where: { tranId: validation.tranId },
      include: { user: { select: { role: true } } },
    });
    if (!payment) return false;
    if (payment.status === 'PAID') {
      await this.grantDiamonds(payment);
      return true;
    }

    if (validation.amount !== payment.amount || validation.currency !== payment.currency) {
      this.logger.warn(`Payment ${payment.tranId} amount or currency mismatch`);
      return false;
    }

    await this.prisma.payment.updateMany({
      where: { id: payment.id, status: 'PENDING' },
      data: {
        status: 'PAID',
        valId: validation.valId,
        method: validation.method,
        bankTranId: validation.bankTranId,
        paidAt: new Date(),
      },
    });

    await this.grantDiamonds(payment);
    return true;
  }

  private async grantDiamonds(payment: { userId: string; planId: string; tranId: string; user: { role: Role | null } }) {
    const { role } = payment.user;
    if ((role !== 'SEEKER' && role !== 'RECRUITER') || !this.isPaidPlan(payment.planId)) {
      this.logger.warn(`Payment ${payment.tranId} has no plan to activate`);
      return;
    }
    await this.diamonds.activatePlan(payment.userId, role, payment.planId, payment.tranId);
  }

  private isPaidPlan(planId: string): planId is PaidPlanId {
    return (PAID_PLAN_IDS as readonly string[]).includes(planId);
  }

  private async redirectUrl(tranId: string | undefined, result: PaymentResult) {
    const payment = tranId
      ? await this.prisma.payment.findUnique({ where: { tranId }, select: { user: { select: { role: true } } } })
      : null;
    const role = payment?.user.role;
    const path = role === 'SEEKER' || role === 'RECRUITER' ? `/dashboard/${role.toLowerCase()}/credits` : '/pricing';
    return `${this.frontendUrl}${path}?payment=${result}`;
  }

  private payingRole(role: Role | null): PayingRole {
    if (role === 'SEEKER' || role === 'RECRUITER') return role;
    throw new ForbiddenException('Only seekers and recruiters can buy a plan');
  }
}
