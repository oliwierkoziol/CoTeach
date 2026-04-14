const CACHE_TTL_MS = 60_000;

let cachedToken = "";
let cachedAt = 0;
let cachedPayload = null;
let inFlightPromise = null;

function normalizeBaseUrl(url) {
  return String(url || "")
    .trim()
    .replace(/\/$/, "");
}

export function clearLicenseStatusCache() {
  cachedToken = "";
  cachedAt = 0;
  cachedPayload = null;
  inFlightPromise = null;
}

export async function fetchLicenseStatusCached({ token, apiBase, force = false }) {
  const authToken = String(token || "").trim();
  if (!authToken) return null;

  const now = Date.now();
  const sameToken = cachedToken === authToken;
  const cacheValid = sameToken && cachedPayload && now - cachedAt < CACHE_TTL_MS;

  if (!force && cacheValid) return cachedPayload;
  if (!force && inFlightPromise && sameToken) return inFlightPromise;

  const base = normalizeBaseUrl(apiBase);
  inFlightPromise = fetch(`${base}/api/account/license-status`, {
    headers: { Authorization: `Bearer ${authToken}` }
  })
    .then(async (response) => {
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        cachedToken = authToken;
        cachedAt = Date.now();
        cachedPayload = null;
        return null;
      }
      cachedToken = authToken;
      cachedAt = Date.now();
      cachedPayload = data;
      return data;
    })
    .catch(() => {
      cachedToken = authToken;
      cachedAt = Date.now();
      cachedPayload = null;
      return null;
    })
    .finally(() => {
      inFlightPromise = null;
    });

  return inFlightPromise;
}
