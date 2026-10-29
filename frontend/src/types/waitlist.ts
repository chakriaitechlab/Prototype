import type { ActionState } from './auth';

export interface WaitlistInput {
  fullName: string;
  email: string;
  occupation?: string;
}

export interface WaitlistResponse {
  success: boolean;
  message: string;
}

export type WaitlistState = ActionState & {
  values?: WaitlistInput;
};
