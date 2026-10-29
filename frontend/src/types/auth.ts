export type UserRole = 'SEEKER' | 'RECRUITER';
export type AuthProvider = 'LOCAL' | 'GOOGLE' | 'LINKEDIN';

export type NextStep =
  | 'verify-email'
  | 'role'
  | 'phone'
  | 'photo'
  | 'username'
  | 'cv'
  | 'career'
  | 'company'
  | 'done';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  role: UserRole | null;
  provider: AuthProvider;
  hasPassword: boolean;
  onboardingCompleted: boolean;
  nextStep: NextStep;
  company: {
    id: string;
    name: string;
    username: string | null;
    logoUrl: string | null;
  } | null;
  seekerProfile: {
    headline: string | null;
    about: string | null;
    cvUrl: string | null;
    cvSkipped: boolean;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  access_token: string;
  user: AuthUser;
}

export interface SignupStatus {
  signupEnabled: boolean;
}

export type OtpType = 'signup' | 'login' | 'reset';

export type ActionState = {
  error?: string;
  message?: string;
};
