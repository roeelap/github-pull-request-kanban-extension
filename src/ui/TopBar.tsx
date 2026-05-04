import { useKanbanStore } from './store';

export function TopBar({ compareUrl }: { compareUrl: string }) {
  const filters = useKanbanStore((s) => s.filters);
  const setFilter = useKanbanStore((s) => s.setFilter);
  const prs = useKanbanStore((s) => s.prs);

  const authors = Array.from(new Set(prs.map((p) => p.author.login))).sort();
  const labels = Array.from(new Set(prs.flatMap((p) => p.labels.map((l) => l.name)))).sort();

  return (
    <div className="topbar">
      <input
        type="search"
        placeholder="Search Pull Requests"
        value={filters.text}
        onChange={(e) => setFilter('text', e.target.value)}
      />
      <select
        value={filters.authors[0] ?? ''}
        onChange={(e) => setFilter('authors', e.target.value ? [e.target.value] : [])}
      >
        <option value="">All authors</option>
        {authors.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
      <select
        value={filters.labels[0] ?? ''}
        onChange={(e) => setFilter('labels', e.target.value ? [e.target.value] : [])}
      >
        <option value="">All labels</option>
        {labels.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
      <a className="new-pr" href={compareUrl} target="_blank" rel="noreferrer">
        New Pull Request
      </a>
    </div>
  );
}
