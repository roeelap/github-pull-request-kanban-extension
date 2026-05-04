import type { Column as ColumnId, EnrichedPR } from '../lib/types';
import { Card } from './Card';

const TITLES: Record<ColumnId, string> = {
  needs_review: 'Needs Review',
  approved: 'Approved',
  ready_to_merge: 'Ready for Merge',
};

export function Column({ id, prs }: { id: ColumnId; prs: EnrichedPR[] }) {
  return (
    <div className="column">
      <div className="column-header">
        <span>{TITLES[id]}</span>
      </div>
      {prs.length === 0 ? (
        <div className="empty">No pull requests</div>
      ) : (
        prs.map((pr) => <Card key={`${pr.repo}#${pr.number}`} pr={pr} />)
      )}
    </div>
  );
}
