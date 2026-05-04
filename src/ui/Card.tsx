import type { CIStatus, EnrichedPR } from '../lib/types';

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="#1f883d"
        d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="#cf222e"
        d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"
      />
    </svg>
  );
}

const DAY_MS = 24 * 60 * 60 * 1000;

function relativeAge(iso: string): { text: string; isOld: boolean } {
  if (!iso) return { text: '', isOld: false };
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return { text: '', isOld: false };
  const minutes = Math.floor(ms / 60_000);
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(ms / DAY_MS);
  let text: string;
  if (days >= 1) text = `${days}d ago`;
  else if (hours >= 1) text = `${hours}h ago`;
  else if (minutes >= 1) text = `${minutes}m ago`;
  else text = 'just now';
  return { text, isOld: ms >= 2 * DAY_MS };
}

function CIIcon({ status }: { status: CIStatus }) {
  if (status === 'none') return null;
  if (status === 'passing') {
    return (
      <span className="ci-icon" title="CI passing">
        <CheckIcon />
      </span>
    );
  }
  if (status === 'failing') {
    return (
      <span className="ci-icon" title="CI failing">
        <XIcon />
      </span>
    );
  }
  return (
    <span
      className="ci-icon"
      title="CI running"
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: '#bf8700',
        display: 'inline-block',
      }}
    />
  );
}

export function Card({ pr }: { pr: EnrichedPR }) {
  const age = relativeAge(pr.createdAt);
  return (
    <a className="card" href={pr.url} target="_blank" rel="noreferrer">
      <div className="card-top">
        <div className="card-title">{pr.title}</div>
        {age.text && (
          <span className={`date-label ${age.isOld ? 'date-label-old' : 'date-label-fresh'}`}>
            {age.text}
          </span>
        )}
      </div>
      {pr.author.login && <div className="card-subtitle">{pr.author.login}</div>}
      <div>
        {pr.labels.slice(0, 3).map((l) => (
          <span key={l.name} className="label-chip" style={{ background: l.color }}>
            {l.name}
          </span>
        ))}
      </div>
      <div className="card-footer">
        <span className="review-status">
          {pr.reviewStatus === 'approved' && <CheckIcon />}
          <span>{pr.reviewStatus === 'approved' ? 'Approved' : 'Waiting for Review'}</span>
        </span>
        <span className="card-meta">
          <CIIcon status={pr.ciStatus} />
          <span className="reviewers">
            {pr.reviewers.slice(0, 4).map((r) => (
              <img key={r.login} src={r.avatarUrl} alt={r.login} title={r.login} />
            ))}
          </span>
        </span>
      </div>
    </a>
  );
}
