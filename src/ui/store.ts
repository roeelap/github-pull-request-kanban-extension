import { create } from 'zustand';
import type { Column, EnrichedPR } from '../lib/types';
import { classify } from '../content/classifier';

interface Filters {
  text: string;
  authors: string[];
  labels: string[];
}

interface KanbanState {
  prs: EnrichedPR[];
  loading: boolean;
  filters: Filters;
  setPRs: (prs: EnrichedPR[]) => void;
  setLoading: (loading: boolean) => void;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}

export const useKanbanStore = create<KanbanState>((set) => ({
  prs: [],
  loading: false,
  filters: { text: '', authors: [], labels: [] },
  setPRs: (prs) => set({ prs }),
  setLoading: (loading) => set({ loading }),
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
}));

export function selectColumn(prs: EnrichedPR[], column: Column, filters: Filters): EnrichedPR[] {
  const text = filters.text.trim().toLowerCase();
  return prs.filter((pr) => {
    if (classify(pr) !== column) return false;
    if (text && !pr.title.toLowerCase().includes(text) && !pr.author.login.toLowerCase().includes(text)) {
      return false;
    }
    if (filters.authors.length && !filters.authors.includes(pr.author.login)) return false;
    if (filters.labels.length && !pr.labels.some((l) => filters.labels.includes(l.name))) return false;
    return true;
  });
}
