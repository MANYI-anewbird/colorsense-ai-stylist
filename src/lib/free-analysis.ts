const STORAGE_KEY = 'colorsense_free_analyses_used';
export const FREE_ANALYSIS_LIMIT = 3;

export function getFreeAnalysesUsed(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    const n = parseInt(v ?? '0', 10);
    return Number.isNaN(n) ? 0 : Math.max(0, n);
  } catch {
    return 0;
  }
}

export function incrementFreeAnalysesUsed(): void {
  if (typeof window === 'undefined') return;
  try {
    const n = getFreeAnalysesUsed();
    localStorage.setItem(STORAGE_KEY, String(n + 1));
  } catch {
    // ignore
  }
}
