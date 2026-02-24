/**
 * Base API service
 * In mock mode, returns mock data. In production, calls real C#/IIS API.
 */

const USE_MOCK = true; // Will switch to env var: import.meta.env.VITE_USE_MOCK !== 'false'

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

/**
 * Generic fetch wrapper with error handling
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Build query string from filters
 */
export function buildFilterParams(filters) {
  const params = new URLSearchParams();
  if (filters?.dateRange?.from)
    params.set("from", filters.dateRange.from.toISOString());
  if (filters?.dateRange?.to)
    params.set("to", filters.dateRange.to.toISOString());
  if (filters?.insurance?.length)
    params.set("insurance", filters.insurance.join(","));
  if (filters?.practice?.length)
    params.set("practice", filters.practice.join(","));
  if (filters?.dnis?.length) params.set("dnis", filters.dnis.join(","));
  if (filters?.callType?.length)
    params.set("callType", filters.callType.join(","));
  return params.toString();
}

export { USE_MOCK };
