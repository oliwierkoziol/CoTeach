/** Klucz historii prezentacji w localStorage — osobno na użytkownika (Supabase user id). */
export const LEGACY_PRESENTATION_HISTORY_KEY = "coteach:presentation-history";

export function presentationHistoryStorageKey(userId) {
  const id = String(userId || "").trim();
  return id ? `coteach:presentation-history:${id}` : LEGACY_PRESENTATION_HISTORY_KEY;
}

export function loadPresentationHistoryRaw(userId) {
  const key = presentationHistoryStorageKey(userId);
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
    if (Array.isArray(parsed) && parsed.length) return { key, list: parsed };
    if (idPresent(userId)) {
      const legacy = JSON.parse(window.localStorage.getItem(LEGACY_PRESENTATION_HISTORY_KEY) || "[]");
      if (Array.isArray(legacy) && legacy.length) {
        const migrated = legacy.map((item) => ({
          ...item,
          ownerId: String(userId).trim()
        }));
        window.localStorage.setItem(key, JSON.stringify(migrated));
        window.localStorage.removeItem(LEGACY_PRESENTATION_HISTORY_KEY);
        return { key, list: migrated };
      }
    }
    return { key, list: Array.isArray(parsed) ? parsed : [] };
  } catch {
    return { key, list: [] };
  }
}

function idPresent(userId) {
  return Boolean(String(userId || "").trim());
}

export function savePresentationHistoryRaw(userId, list) {
  const key = presentationHistoryStorageKey(userId);
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.isArray(list) ? list.slice(0, 20) : []));
  } catch {
    // ignore
  }
}
