import type { CIStatus, ReviewStatus, ShallowPR } from '../lib/types';
import { SELECTORS } from './selectors';

export function scrapePRList(root: ParentNode = document): ShallowPR[] {
  const rows = Array.from(root.querySelectorAll<HTMLElement>(SELECTORS.prRow));
  const out: ShallowPR[] = [];

  for (const row of rows) {
    const parsed = parseRow(row);
    if (parsed) out.push(parsed);
  }

  return out;
}

function parseRow(row: HTMLElement): ShallowPR | null {
  const titleEl = row.querySelector<HTMLAnchorElement>(SELECTORS.prTitle);
  if (!titleEl) return null;

  const url = titleEl.href;
  const match = url.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/);
  if (!match) return null;

  const [, repo, numberStr] = match;
  const number = Number(numberStr);

  const isDraft = !!row.querySelector(SELECTORS.prDraftIcon);

  const labelEls = Array.from(row.querySelectorAll<HTMLElement>(SELECTORS.prLabels));
  const labels = labelEls.map((el) => ({
    name: el.textContent?.trim() ?? '',
    color: extractLabelColor(el),
  }));

  const meta = row.querySelector<HTMLElement>(SELECTORS.prMeta);
  const authorLink = meta?.querySelector<HTMLAnchorElement>('a.Link--muted');
  const authorLogin = authorLink?.textContent?.trim() ?? '';
  const authorAvatar = authorLink?.querySelector<HTMLImageElement>('img')?.src ?? '';

  const createdAtEl = row.querySelector<HTMLElement>('relative-time, time-ago');
  const createdAt = createdAtEl?.getAttribute('datetime') ?? '';

  const commentEl = row.querySelector<HTMLElement>(SELECTORS.prCommentCount);
  const commentCount = Number(commentEl?.textContent?.trim() ?? '0') || 0;

  const reviewStatus = readReviewStatus(row);
  const ciStatus = readCIStatus(row);

  return {
    number,
    title: titleEl.textContent?.trim() ?? '',
    url,
    repo,
    author: { login: authorLogin, avatarUrl: authorAvatar },
    labels,
    isDraft,
    createdAt,
    commentCount,
    reviewStatus,
    ciStatus,
  };
}

function readCIStatus(row: HTMLElement): CIStatus {
  const svg = row.querySelector('details.commit-build-statuses summary svg.octicon');
  if (!svg) return 'none';
  if (svg.classList.contains('octicon-check')) return 'passing';
  if (svg.classList.contains('octicon-x')) return 'failing';
  if (svg.classList.contains('octicon-dot-fill')) return 'running';
  return 'none';
}

function readReviewStatus(row: HTMLElement): ReviewStatus {
  const link = row.querySelector<HTMLAnchorElement>('a[href*="#partial-pull-merging"]');
  if (!link) return 'unknown';
  const label = (link.getAttribute('aria-label') ?? '').toLowerCase();
  const text = (link.textContent ?? '').toLowerCase();
  const haystack = `${label} ${text}`;
  if (/changes? requested/.test(haystack)) return 'changes_requested';
  if (/approval|approved/.test(haystack)) return 'approved';
  if (/review required/.test(haystack)) return 'review_required';
  return 'unknown';
}

function extractLabelColor(el: HTMLElement): string {
  const style = el.getAttribute('style') ?? '';
  const m = style.match(/--label-r:\s*(\d+);\s*--label-g:\s*(\d+);\s*--label-b:\s*(\d+)/);
  if (m) return `rgb(${m[1]}, ${m[2]}, ${m[3]})`;
  const bg = el.style.backgroundColor;
  return bg || '#888';
}
