export const SELECTORS = {
  prListContainer: 'div.js-issue-row, [data-testid="issue-list"] li',
  prRow: 'div.js-issue-row, [data-testid="issue-list"] li',
  prTitle: 'a[data-hovercard-type="pull_request"]',
  prMeta: '.opened-by',
  prLabels: 'a.IssueLabel',
  prDraftIcon: 'svg.octicon-git-pull-request-draft',
  prCommentCount: 'a[aria-label$="comments"]',
} as const;

export const PR_LIST_URL_PATTERN = /^https:\/\/github\.com\/[^/]+\/[^/]+\/pulls/;

export function isPRListPage(href: string = window.location.href): boolean {
  return PR_LIST_URL_PATTERN.test(href);
}
