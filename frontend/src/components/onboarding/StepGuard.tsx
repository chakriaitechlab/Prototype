import { requireOnboardingStep } from '@/utils/session';
import type { UserRole } from '@/types/auth';
import type { OnboardingStep } from '@/utils/routes';

export async function StepGuard({ role, step }: { role: UserRole; step: OnboardingStep }) {
  await requireOnboardingStep(role, step);
  return null;
}
