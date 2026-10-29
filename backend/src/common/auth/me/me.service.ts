import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';

const AUTH_USER_INCLUDE = {
  company: true,
  seekerProfile: true,
} as const satisfies Prisma.UserInclude;

type AuthUserRecord = Prisma.UserGetPayload<{ include: typeof AUTH_USER_INCLUDE }>;

type OnboardingStep =
  | 'verify-email'
  | 'role'
  | 'phone'
  | 'photo'
  | 'username'
  | 'cv'
  | 'career'
  | 'company'
  | 'done';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: AUTH_USER_INCLUDE,
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toAuthUser(user);
  }

  private toAuthUser(user: AuthUserRecord) {
    const { company, seekerProfile } = user;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      phoneNumber: user.phoneNumber,
      phoneVerified: user.phoneVerified,
      emailVerified: user.emailVerified,
      role: user.role,
      provider: user.provider,
      hasPassword: Boolean(user.passwordHash),
      onboardingCompleted: user.onboardingCompleted,
      nextStep: this.resolveNextStep(user),
      company: company && {
        id: company.id,
        name: company.name,
        username: company.username,
        logoUrl: company.logoUrl,
      },
      seekerProfile: seekerProfile && {
        headline: seekerProfile.headline,
        about: seekerProfile.about,
        cvUrl: seekerProfile.cvUrl,
        cvSkipped: seekerProfile.cvSkipped,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private resolveNextStep(user: AuthUserRecord): OnboardingStep {
    if (!user.emailVerified) return 'verify-email';
    if (!user.role) return 'role';
    if (!user.phoneVerified) return 'phone';
    if (!user.avatarUrl) return 'photo';

    if (user.role === 'RECRUITER') {
      if (!user.company) return 'company';
      if (!user.company.username) return 'username';
      return user.onboardingCompleted ? 'done' : 'username';
    }

    if (!user.username) return 'username';
    if (user.onboardingCompleted) return 'done';
    if (!user.seekerProfile?.cvUrl && !user.seekerProfile?.cvSkipped) return 'cv';
    return 'career';
  }
}
