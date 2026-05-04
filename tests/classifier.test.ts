import { describe, expect, it } from 'vitest';
import { classify } from '../src/content/classifier';
import type { EnrichedPR } from '../src/lib/types';

const base: EnrichedPR = {
  number: 1,
  title: 'test',
  url: 'https://github.com/o/r/pull/1',
  repo: 'o/r',
  author: { login: 'a', avatarUrl: '' },
  labels: [],
  isDraft: false,
  createdAt: '2026-05-04T00:00:00Z',
  commentCount: 0,
  reviewStatus: 'approved',
  ciStatus: 'passing',
  reviewers: [{ login: 'r', avatarUrl: '', state: 'approved' }],
  approvals: { received: 1, required: 1 },
  mergeable: true,
};

describe('classify', () => {
  it('routes review_required to needs_review', () => {
    expect(classify({ ...base, reviewStatus: 'review_required' })).toBe('needs_review');
  });

  it('routes changes_requested to needs_review', () => {
    expect(classify({ ...base, reviewStatus: 'changes_requested' })).toBe('needs_review');
  });

  it('routes drafts to needs_review when not approved', () => {
    expect(classify({ ...base, isDraft: true, reviewStatus: 'unknown' })).toBe('needs_review');
  });

  it('routes approved + passing CI to ready_to_merge', () => {
    expect(classify({ ...base, reviewStatus: 'approved', ciStatus: 'passing' })).toBe(
      'ready_to_merge',
    );
  });

  it('routes approved + no CI to ready_to_merge', () => {
    expect(classify({ ...base, reviewStatus: 'approved', ciStatus: 'none' })).toBe(
      'ready_to_merge',
    );
  });

  it('routes approved + running CI to approved', () => {
    expect(classify({ ...base, reviewStatus: 'approved', ciStatus: 'running' })).toBe('approved');
  });

  it('routes approved + failing CI to approved', () => {
    expect(classify({ ...base, reviewStatus: 'approved', ciStatus: 'failing' })).toBe('approved');
  });
});
