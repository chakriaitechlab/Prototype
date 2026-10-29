import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import type { DiamondWallet, Role } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import type { PaidPlanId } from '../payments/dto/checkout.dto.js';
import { PlansQueryDto } from './dto/plans-query.dto.js';

const CURRENCY = 'BDT';
const FREE_PLAN_ID = 'free';
const PLAN_PERIOD_DAYS = 30;
const PLAN_PERIOD_MS = PLAN_PERIOD_DAYS * 24 * 60 * 60 * 1000;
const USAGE_LIMIT = 50;

export type PayingRole = Extract<Role, 'SEEKER' | 'RECRUITER'>;
type PlanId = typeof FREE_PLAN_ID | PaidPlanId;

interface DiamondPlan {
  id: PlanId;
  name: string;
  price: number;
  diamonds: number;
  popular?: boolean;
}

const PLANS: Record<PayingRole, DiamondPlan[]> = {
  SEEKER: [
    { id: 'free', name: 'Free', price: 0, diamonds: 50 },
    { id: 'pro', name: 'Pro', price: 699, diamonds: 600, popular: true },
    { id: 'premium', name: 'Premium', price: 1299, diamonds: 1500 },
  ],
  RECRUITER: [
    { id: 'free', name: 'Free', price: 0, diamonds: 50 },
    { id: 'pro', name: 'Recruiter Pro', price: 999, diamonds: 800, popular: true },
    { id: 'premium', name: 'Recruiter Enterprise', price: 1999, diamonds: 2000 },
  ],
};

@Injectable()
export class DiamondsService {
  constructor(private readonly prisma: PrismaService) {}

  plans(dto: PlansQueryDto) {
    const { role } = dto;
    const plans = PLANS[role === 'seeker' ? 'SEEKER' : 'RECRUITER'].map((plan) => ({ ...plan, currency: CURRENCY }));
    return { plans, periodDays: PLAN_PERIOD_DAYS };
  }

  paidPlan(role: PayingRole, planId: PaidPlanId) {
    return this.plan(role, planId);
  }

  async wallet(userId: string, role: Role | null) {
    const payingRole = this.payingRole(role);
    const wallet = await this.sync(userId, payingRole);
    const plan = this.plan(payingRole, wallet.planId);

    return {
      balance: wallet.balance,
      planId: plan.id,
      planName: plan.name,
      monthlyDiamonds: plan.diamonds,
      planExpiresAt: wallet.planExpiresAt,
      refillAt: wallet.refillAt,
    };
  }

  async usage(userId: string, role: Role | null) {
    await this.sync(userId, this.payingRole(role));

    const activity = await this.prisma.diamondTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: USAGE_LIMIT,
      select: { id: true, action: true, amount: true, balanceAfter: true, planId: true, createdAt: true },
    });

    return { activity };
  }

  async activatePlan(userId: string, role: PayingRole, planId: PaidPlanId, ref: string) {
    await this.sync(userId, role);
    const plan = this.plan(role, planId);

    try {
      await this.prisma.$transaction(async (tx) => {
        const granted = await tx.diamondTransaction.findUnique({
          where: { action_ref: { action: 'PLAN_PURCHASE', ref } },
          select: { id: true },
        });
        if (granted) return;

        const expiresAt = new Date(Date.now() + PLAN_PERIOD_MS);
        const wallet = await tx.diamondWallet.update({
          where: { userId },
          data: { balance: { increment: plan.diamonds }, planId, planExpiresAt: expiresAt, refillAt: expiresAt },
        });

        await tx.diamondTransaction.create({
          data: { userId, action: 'PLAN_PURCHASE', amount: plan.diamonds, balanceAfter: wallet.balance, planId, ref },
        });
      });
    } catch (error) {
      if (!this.isUniqueConflict(error)) throw error;
    }
  }

  private async sync(userId: string, role: PayingRole): Promise<DiamondWallet> {
    const wallet = await this.prisma.diamondWallet.findUnique({ where: { userId } });
    if (!wallet) return this.open(userId, role);

    const now = new Date();
    if (wallet.refillAt > now) return wallet;

    const expired = !wallet.planExpiresAt || wallet.planExpiresAt <= now;
    const planId = expired ? FREE_PLAN_ID : wallet.planId;
    const { diamonds } = this.plan(role, planId);

    let refillAt = wallet.refillAt.getTime();
    while (refillAt <= now.getTime()) refillAt += PLAN_PERIOD_MS;

    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.diamondWallet.updateMany({
        where: { id: wallet.id, refillAt: wallet.refillAt },
        data: {
          balance: diamonds,
          planId,
          planExpiresAt: expired ? null : wallet.planExpiresAt,
          refillAt: new Date(refillAt),
        },
      });
      if (count === 0) return;

      await tx.diamondTransaction.create({
        data: { userId, action: 'MONTHLY_REFILL', amount: diamonds, balanceAfter: diamonds, planId },
      });
    });

    return this.prisma.diamondWallet.findUniqueOrThrow({ where: { userId } });
  }

  private async open(userId: string, role: PayingRole): Promise<DiamondWallet> {
    const { diamonds } = this.plan(role, FREE_PLAN_ID);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const wallet = await tx.diamondWallet.create({
          data: { userId, balance: diamonds, planId: FREE_PLAN_ID, refillAt: new Date(Date.now() + PLAN_PERIOD_MS) },
        });
        await tx.diamondTransaction.create({
          data: { userId, action: 'SIGNUP_BONUS', amount: diamonds, balanceAfter: diamonds, planId: FREE_PLAN_ID },
        });
        return wallet;
      });
    } catch (error) {
      if (!this.isUniqueConflict(error)) throw error;
      return this.prisma.diamondWallet.findUniqueOrThrow({ where: { userId } });
    }
  }

  private plan(role: PayingRole, planId: string): DiamondPlan {
    const plans = PLANS[role];
    return plans.find((plan) => plan.id === planId) ?? plans[0];
  }

  private payingRole(role: Role | null): PayingRole {
    if (role === 'SEEKER' || role === 'RECRUITER') return role;
    throw new ForbiddenException('Diamonds are only available to seekers and recruiters');
  }

  private isUniqueConflict(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }
}
