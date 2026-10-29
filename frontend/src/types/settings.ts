export interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  applicationUpdates: boolean;
  interviewReminders: boolean;
  jobMatches: boolean;
}

export interface LoginSession {
  id: string;
  ip: string | null;
  userAgent: string | null;
  device: string;
  createdAt: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessions: LoginSession[];
}

export type AlertKey = Exclude<keyof NotificationSettings, 'emailEnabled'>;

export interface SettingsCopy {
  title: string;
  alerts: Record<AlertKey, { title: string; note: string }>;
  deleteAccount: {
    description: string;
    consequences: string[];
    accountLabel: string;
  };
}

export type TwoFactorState = {
  error?: string;
  message?: string;
  twoFactorEnabled?: boolean;
};
