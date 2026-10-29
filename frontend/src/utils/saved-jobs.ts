const SAVED_JOBS_KEY = 'chakri_saved_jobs';
const SAVED_JOBS_EVENT = 'chakri-saved-jobs';
const EMPTY: string[] = [];

let cachedRaw: string | null = null;
let cachedIds: string[] = EMPTY;

export function getSavedJobIds(): string[] {
  try {
    const raw = window.localStorage.getItem(SAVED_JOBS_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedIds = raw ? (JSON.parse(raw) as string[]) : EMPTY;
    }
  } catch {
    return cachedIds;
  }
  return cachedIds;
}

export function getServerSavedJobIds(): string[] {
  return EMPTY;
}

export function subscribeSavedJobs(onChange: () => void) {
  window.addEventListener(SAVED_JOBS_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(SAVED_JOBS_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/** Saves or un-saves a job and returns whether it is now saved. */
export function toggleSavedJob(id: string) {
  const current = getSavedJobIds();
  const next = current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id];

  try {
    window.localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(SAVED_JOBS_EVENT));
  } catch {
    return current.includes(id);
  }

  return next.includes(id);
}

/** Synchronizes saved IDs from the server into localStorage and notifies listeners. */
export function syncSavedJobIds(ids: string[]) {
  try {
    cachedRaw = JSON.stringify(ids);
    cachedIds = ids;
    window.localStorage.setItem(SAVED_JOBS_KEY, cachedRaw);
    window.dispatchEvent(new Event(SAVED_JOBS_EVENT));
  } catch {
    // Ignore storage errors in restricted contexts
  }
}
