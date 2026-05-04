import { cacheKey, getCacheEntry, setCacheEntry } from '../lib/storage';
import { pMap } from '../lib/throttle';
import type { EnrichedPR, Reviewer, ReviewState, ShallowPR } from '../lib/types';

const CACHE_TTL_MS = 2 * 60 * 1000;
const CONCURRENCY = 6;

export async function enrich(prs: ShallowPR[]): Promise<EnrichedPR[]> {
  return pMap(prs, enrichOne, CONCURRENCY);
}

async function enrichOne(pr: ShallowPR): Promise<EnrichedPR> {
  const key = cacheKey(pr.repo, pr.number);
  const cached = await getCacheEntry(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { ...cached.data, ...pr };
  }

  const detail = await fetchDetail(pr).catch(() => null);
  const enriched: EnrichedPR = {
    ...pr,
    reviewers: detail?.reviewers ?? [],
    approvals: detail?.approvals ?? { received: 0, required: 1 },
    mergeable: detail?.mergeable ?? null,
    headSha: detail?.headSha,
  };
  await setCacheEntry(key, {
    data: enriched,
    fetchedAt: Date.now(),
    headSha: detail?.headSha,
  });
  return enriched;
}

interface DetailParts {
  reviewers: Reviewer[];
  approvals: { received: number; required: number };
  mergeable: boolean | null;
  headSha?: string;
}

async function fetchDetail(pr: ShallowPR): Promise<DetailParts | null> {
  const res = await fetch(pr.url, { credentials: 'include' });
  if (!res.ok) return null;
  const html = await res.text();
  return parseDetailHtml(html);
}

export function parseDetailHtml(html: string): DetailParts {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const reviewers = readReviewers(doc);
  const approvals = readApprovals(doc, reviewers);
  const mergeable = readMergeable(doc);
  const headSha = doc
    .querySelector<HTMLElement>('.commit-ref.head-ref [data-hovercard-type="commit"]')
    ?.getAttribute('data-hovercard-url')
    ?.match(/\/commit\/([0-9a-f]+)/)?.[1];

  return { reviewers, approvals, mergeable, headSha };
}

function readReviewers(doc: Document): Reviewer[] {
  const items = Array.from(
    doc.querySelectorAll<HTMLElement>('.js-issue-sidebar-form .reviewers-status-icon, [data-testid="review-list"] li'),
  );
  return items
    .map((el): Reviewer | null => {
      const login = el.querySelector<HTMLAnchorElement>('a.Link--primary, a[data-hovercard-type="user"]')
        ?.textContent?.trim();
      const avatar = el.querySelector<HTMLImageElement>('img.avatar')?.src ?? '';
      const state = mapReviewState(el);
      if (!login) return null;
      return { login, avatarUrl: avatar, state };
    })
    .filter((r): r is Reviewer => r !== null);
}

function mapReviewState(el: HTMLElement): ReviewState {
  const html = el.innerHTML;
  if (/octicon-check|approved/i.test(html)) return 'approved';
  if (/octicon-x|changes-requested/i.test(html)) return 'changes_requested';
  if (/octicon-comment/i.test(html)) return 'commented';
  if (/octicon-dot-fill|pending/i.test(html)) return 'pending';
  return 'pending';
}

function readApprovals(doc: Document, reviewers: Reviewer[]): { received: number; required: number } {
  const received = reviewers.filter((r) => r.state === 'approved').length;
  const requiredAttr = doc
    .querySelector<HTMLElement>('[data-required-approving-review-count]')
    ?.getAttribute('data-required-approving-review-count');
  const required = requiredAttr ? Number(requiredAttr) : Math.max(reviewers.length, 1);
  return { received, required };
}

function readMergeable(doc: Document): boolean | null {
  const box = doc.querySelector<HTMLElement>('.merge-message, .branch-action-state-clean, .branch-action-state-dirty');
  if (!box) return null;
  if (box.classList.contains('branch-action-state-clean')) return true;
  if (box.classList.contains('branch-action-state-dirty')) return false;
  return null;
}
