export type CIStatus = 'passing' | 'failing' | 'running' | 'none';

export type ReviewState =
  | 'approved'
  | 'changes_requested'
  | 'commented'
  | 'pending'
  | 'dismissed';

export type Column = 'needs_review' | 'approved' | 'ready_to_merge';

export type ReviewStatus = 'approved' | 'changes_requested' | 'review_required' | 'unknown';

export interface Reviewer {
  login: string;
  avatarUrl: string;
  state: ReviewState;
}

export interface Label {
  name: string;
  color: string;
}

export interface Author {
  login: string;
  avatarUrl: string;
}

export interface ShallowPR {
  number: number;
  title: string;
  url: string;
  repo: string;
  author: Author;
  labels: Label[];
  isDraft: boolean;
  createdAt: string;
  commentCount: number;
  reviewStatus: ReviewStatus;
  ciStatus: CIStatus;
}

export interface EnrichedPR extends ShallowPR {
  reviewers: Reviewer[];
  approvals: { received: number; required: number };
  mergeable: boolean | null;
  headSha?: string;
}

export interface CacheEntry {
  data: EnrichedPR;
  fetchedAt: number;
  headSha?: string;
}

export interface Settings {
  refreshIntervalSec: number;
}

export const DEFAULT_SETTINGS: Settings = {
  refreshIntervalSec: 60,
};
