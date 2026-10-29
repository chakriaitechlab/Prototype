import type { ActionState } from './auth';

export interface SupportContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SupportContactResponse {
  success: boolean;
  message: string;
}

export type SupportContactState = ActionState & {
  values?: SupportContactInput;
};
