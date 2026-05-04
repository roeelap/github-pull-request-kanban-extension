import type { Column, EnrichedPR } from '../lib/types';

export function classify(pr: EnrichedPR): Column {
  if (pr.reviewStatus !== 'approved') {
    return 'needs_review';
  }

  const ciPassed = pr.ciStatus === 'passing' || pr.ciStatus === 'none';
  return ciPassed ? 'ready_to_merge' : 'approved';
}
