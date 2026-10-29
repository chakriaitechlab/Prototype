export type InterviewStatus = 'INVITED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
export type InterviewLanguage = 'english' | 'bangla';
export type InterviewPhase = 'INTRO' | 'SKILL';
export type InterviewReportStatus = 'PENDING' | 'READY' | 'FAILED';
export type SpeechKind = 'preview' | 'greeting' | 'question' | 'transition' | 'silence' | 'skip' | 'closing';

export type ViolationType =
  | 'camera_unavailable'
  | 'camera_interrupted'
  | 'face_missing'
  | 'multiple_faces'
  | 'mobile_phone'
  | 'tab_hidden'
  | 'window_blur'
  | 'fullscreen_exit';

export interface InterviewSession {
  id: string;
  status: InterviewStatus;
  language: InterviewLanguage;
  skills: string[];
  difficulty: string;
  expiresAt: string;
  startedAt: string | null;
  completedAt: string | null;
  durationSeconds: number | null;
  job: {
    id: string;
    title: string;
    employmentType: string | null;
    location: string | null;
    company: { name: string; logoUrl: string | null };
  };
  report: { status: InterviewReportStatus; overallScore: number | null } | null;
}

export interface InterviewTurn {
  id: string;
  position: number;
  phase: InterviewPhase;
  skill: string | null;
  questionType: string;
  question: string;
}

export interface InterviewStart {
  language: InterviewLanguage;
  turn: InterviewTurn;
}

export type InterviewNextStep = { done: false; transition: boolean; turn: InterviewTurn } | { done: true };

export interface ViolationResult {
  warnings: number;
  maxWarnings: number;
  ended: boolean;
}

export interface Violation {
  type: ViolationType;
  message: string;
}

export interface SkillScore {
  skillName: string;
  score: number;
  summary: string;
}

export interface ReportTurn {
  id: string;
  position: number;
  phase: InterviewPhase;
  skill: string | null;
  questionType: string;
  question: string;
  answer: string | null;
  marks: number | null;
  verdict: string | null;
  feedback: string | null;
  idealAnswer: string | null;
}

export interface InterviewReport {
  viewerRole: 'SEEKER' | 'RECRUITER';
  interview: {
    id: string;
    status: InterviewStatus;
    language: 'ENGLISH' | 'BANGLA';
    startedAt: string | null;
    completedAt: string | null;
    durationSeconds: number | null;
    warnings: number;
    endReason: string | null;
  };
  job: { id: string; title: string; company: string };
  candidate: { id: string; name: string | null; username: string | null; avatarUrl: string | null };
  report: {
    status: InterviewReportStatus;
    overallScore: number | null;
    verdict: string | null;
    summary: string | null;
    skillScores: SkillScore[];
    strengths: string[];
    weaknesses: string[];
  } | null;
  turns: ReportTurn[];
}

export type InterviewActionResult<T> = { data: T } | { error: string };
