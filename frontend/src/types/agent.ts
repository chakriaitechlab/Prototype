export type AgentSessionStatus = 'RUNNING' | 'WAITING_INPUT' | 'IDLE' | 'STOPPED' | 'FAILED';

export type AgentStepKind =
  | 'USER'
  | 'ASSISTANT'
  | 'SEARCH'
  | 'FETCH'
  | 'NAVIGATE'
  | 'CLICK'
  | 'TYPE'
  | 'SCROLL'
  | 'BACK'
  | 'ASK'
  | 'GMAIL'
  | 'ERROR';

export type AgentStepData =
  | {
      type: 'approval';
      title: string;
      fields: { label: string; value: string }[];
      body?: string;
      confirmLabel: string;
      cancelLabel: string;
    }
  | { type: 'question'; options: string[] }
  | { type: 'connect'; provider: AgentConnectorProvider };

export interface AgentStep {
  index: number;
  kind: AgentStepKind;
  note: string;
  url: string | null;
  data?: AgentStepData | null;
  createdAt: string;
}

export interface AgentSession {
  id: string;
  title: string;
  status: AgentSessionStatus;
  stepCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentSessionDetail extends AgentSession {
  steps: AgentStep[];
}

export interface AgentScreenshot {
  image: string;
  url: string;
}

export interface AgentJoinResult {
  session: AgentSessionDetail;
  screenshot: AgentScreenshot | null;
}

export interface AgentSocketToken {
  token: string;
  expiresIn: number;
}

export type AgentConnectorProvider = 'GMAIL';

export interface AgentConnector {
  provider: AgentConnectorProvider;
  email: string;
  createdAt: string;
}

export type AgentActionResult<T> = { data: T; error?: undefined } | { data?: undefined; error: string };
