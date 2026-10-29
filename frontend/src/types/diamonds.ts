export type PlanAudience = 'seeker' | 'recruiter';

export type DiamondPlanId = 'free' | 'pro' | 'premium';

export interface DiamondPlan {
  id: DiamondPlanId;
  name: string;
  price: number;
  diamonds: number;
  popular?: boolean;
  currency: string;
}

export interface DiamondPlans {
  plans: DiamondPlan[];
  periodDays: number;
}

export interface DiamondWallet {
  balance: number;
  planId: DiamondPlanId;
  planName: string;
  monthlyDiamonds: number;
  planExpiresAt: string | null;
  refillAt: string;
}

export type DiamondAction = 'SIGNUP_BONUS' | 'MONTHLY_REFILL' | 'PLAN_PURCHASE';

export interface DiamondActivity {
  id: string;
  action: DiamondAction;
  amount: number;
  balanceAfter: number;
  planId: DiamondPlanId;
  createdAt: string;
}

export interface DiamondUsage {
  activity: DiamondActivity[];
}
