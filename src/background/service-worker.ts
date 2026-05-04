const REFRESH_ALARM = 'gh-pr-kanban-refresh';

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(REFRESH_ALARM, { periodInMinutes: 5 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === REFRESH_ALARM) {
    cleanupCache().catch(() => undefined);
  }
});

async function cleanupCache(): Promise<void> {
  const all = (await chrome.storage.local.get('cache'))['cache'] ?? {};
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  let changed = false;
  for (const key of Object.keys(all)) {
    if ((all[key]?.fetchedAt ?? 0) < cutoff) {
      delete all[key];
      changed = true;
    }
  }
  if (changed) {
    await chrome.storage.local.set({ cache: all });
  }
}
