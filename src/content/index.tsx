import { createRoot } from 'react-dom/client';
import { KanbanRoot } from '../ui/KanbanRoot';
import { useKanbanStore } from '../ui/store';
import { listen } from './bridge';
import { enrich } from './enricher';
import { scrapePRList } from './scraper';
import { mountToggle } from './toggle';
import { isPRListPage } from './selectors';
import { getSettings } from '../lib/storage';
import styles from '../ui/styles.css?inline';

const HOST_ID = 'gh-pr-kanban-host';
const HIDE_STYLE_ID = 'gh-pr-kanban-hide';

let unmount: (() => void) | null = null;
let refreshTimer: number | null = null;

bootstrap();
window.addEventListener('turbo:load', bootstrap);
window.addEventListener('popstate', bootstrap);

async function bootstrap() {
  if (!isPRListPage()) {
    teardown();
    return;
  }

  const repo = parseRepoFromUrl();
  if (!repo) return;

  const toggle = await mountToggle(repo);
  toggle.onChange((on) => (on ? mount(repo) : teardown()));
  if (toggle.isOn()) mount(repo);
}

function parseRepoFromUrl(): string | null {
  const m = window.location.pathname.match(/^\/([^/]+)\/([^/]+)\/pulls/);
  return m ? `${m[1]}/${m[2]}` : null;
}

async function mount(repo: string) {
  if (unmount) return;

  const host = document.createElement('div');
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });
  const styleTag = document.createElement('style');
  styleTag.textContent = styles;
  shadow.appendChild(styleTag);

  const reactRoot = document.createElement('div');
  shadow.appendChild(reactRoot);

  const tableContainer = document.querySelector('.repository-content, main');
  tableContainer?.parentElement?.insertBefore(host, tableContainer);

  hideOriginal();

  const root = createRoot(reactRoot);
  root.render(<KanbanRoot repo={repo} onMount={() => refresh()} />);

  const settings = await getSettings();
  refreshTimer = window.setInterval(refresh, settings.refreshIntervalSec * 1000);

  const stopObserver = observePRList(refresh);

  const stopBridge = listen(() => {
    // future: react to GitHub's own XHR responses to invalidate cache
  });

  unmount = () => {
    if (refreshTimer !== null) clearInterval(refreshTimer);
    refreshTimer = null;
    stopObserver();
    stopBridge();
    root.unmount();
    host.remove();
    showOriginal();
  };
}

function observePRList(onChange: () => void): () => void {
  let timeout: number | null = null;
  const trigger = () => {
    if (timeout !== null) clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      timeout = null;
      onChange();
    }, 300);
  };

  const target =
    document.querySelector('.repository-content') ?? document.querySelector('main') ?? document.body;
  const observer = new MutationObserver(trigger);
  observer.observe(target, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'aria-label', 'data-channel'],
  });

  return () => {
    observer.disconnect();
    if (timeout !== null) clearTimeout(timeout);
  };
}

function teardown() {
  if (unmount) {
    unmount();
    unmount = null;
  }
}

async function refresh() {
  const store = useKanbanStore.getState();
  store.setLoading(true);
  try {
    const shallow = scrapePRList();
    const enriched = await enrich(shallow);
    store.setPRs(enriched);
  } finally {
    store.setLoading(false);
  }
}

function hideOriginal() {
  if (document.getElementById(HIDE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = HIDE_STYLE_ID;
  style.textContent = `.repository-content > .Box,
    .repository-content > [data-testid="issue-list"],
    .application-main .js-navigation-container { display: none !important; }`;
  document.head.appendChild(style);
}

function showOriginal() {
  document.getElementById(HIDE_STYLE_ID)?.remove();
}
