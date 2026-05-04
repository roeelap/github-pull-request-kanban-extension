import { DEFAULT_SETTINGS, type CacheEntry, type Settings } from './types';

const CACHE_KEY = 'cache';
const SETTINGS_KEY = 'settings';
const TOGGLE_KEY = 'toggle';

export async function getToggle(repo: string): Promise<boolean> {
  const all = (await chrome.storage.sync.get(TOGGLE_KEY))[TOGGLE_KEY] ?? {};
  return !!all[repo];
}

export async function setToggle(repo: string, on: boolean): Promise<void> {
  const all = (await chrome.storage.sync.get(TOGGLE_KEY))[TOGGLE_KEY] ?? {};
  all[repo] = on;
  await chrome.storage.sync.set({ [TOGGLE_KEY]: all });
}

export async function getSettings(): Promise<Settings> {
  const stored = (await chrome.storage.sync.get(SETTINGS_KEY))[SETTINGS_KEY];
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
}

export async function setSettings(s: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.sync.set({ [SETTINGS_KEY]: { ...current, ...s } });
}

export async function getCacheEntry(key: string): Promise<CacheEntry | undefined> {
  const all = (await chrome.storage.local.get(CACHE_KEY))[CACHE_KEY] ?? {};
  return all[key];
}

export async function setCacheEntry(key: string, entry: CacheEntry): Promise<void> {
  const all = (await chrome.storage.local.get(CACHE_KEY))[CACHE_KEY] ?? {};
  all[key] = entry;
  await chrome.storage.local.set({ [CACHE_KEY]: all });
}

export async function clearCache(): Promise<void> {
  await chrome.storage.local.remove(CACHE_KEY);
}

export function cacheKey(repo: string, number: number): string {
  return `${repo}#${number}`;
}
