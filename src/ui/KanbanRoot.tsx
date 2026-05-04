import { useEffect } from 'react';
import { Column } from './Column';
import { TopBar } from './TopBar';
import { selectColumn, useKanbanStore } from './store';

export function KanbanRoot({
  repo,
  onMount,
}: {
  repo: string;
  onMount: () => void;
}) {
  const prs = useKanbanStore((s) => s.prs);
  const filters = useKanbanStore((s) => s.filters);
  const loading = useKanbanStore((s) => s.loading);

  useEffect(() => {
    onMount();
  }, [onMount]);

  const compareUrl = `https://github.com/${repo}/compare`;

  return (
    <div className="kanban">
      <TopBar compareUrl={compareUrl} />
      <div className="columns">
        <Column id="needs_review" prs={selectColumn(prs, 'needs_review', filters)} />
        <Column id="approved" prs={selectColumn(prs, 'approved', filters)} />
        <Column id="ready_to_merge" prs={selectColumn(prs, 'ready_to_merge', filters)} />
      </div>
      {loading && <div className="empty">Refreshing…</div>}
    </div>
  );
}
