export interface RecruiterStats {
  applicants: number;
  hired: number;
}

export interface TalentCandidate {
  id: string;
  username: string | null;
  name: string;
  title: string;
  location: string;
  avatarUrl: string | null;
  phoneVerified: boolean;
  isSaved: boolean;
}

export interface TalentCandidatesQuery {
  q?: string;
  page?: number;
  limit?: number;
}

export interface TalentCandidatesResponse {
  items: TalentCandidate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
