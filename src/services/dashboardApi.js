/**
 * Dashboard API — All 17 metric data fetchers
 * Uses mock data in dev, real API in production.
 */
import { USE_MOCK, apiFetch, buildFilterParams } from "./api";
import * as mock from "../mock/mockDashboardData";

// Small delay to simulate network in mock mode
const mockDelay = () =>
  new Promise((r) => setTimeout(r, Math.random() * 300 + 100));

// ── M1: Total Calls Initiated ──
export async function fetchTotalCalls(filters) {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generateTotalCalls(filters);
  }
  return apiFetch(`/dashboard/total-calls?${buildFilterParams(filters)}`);
}

// ── M2: Successful Connection Rate ──
export async function fetchConnectionRate(filters) {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generateConnectionRate(filters);
  }
  return apiFetch(`/dashboard/connection-rate?${buildFilterParams(filters)}`);
}

// ── M3: Call Drop Rate ──
export async function fetchDropRate(filters) {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generateDropRate(filters);
  }
  return apiFetch(`/dashboard/drop-rate?${buildFilterParams(filters)}`);
}

// ── M4: Peak Calling Hours ──
export async function fetchPeakHours(filters) {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generatePeakHours(filters);
  }
  return apiFetch(`/dashboard/peak-hours?${buildFilterParams(filters)}`);
}

// ── M5: Active Calls Real-Time ──
export async function fetchActiveCalls() {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generateActiveCalls();
  }
  return apiFetch("/dashboard/active-calls");
}

// ── M6: Call Duration (P90/P95) ──
export async function fetchCallDuration(filters) {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generateCallDuration(filters);
  }
  return apiFetch(`/dashboard/call-duration?${buildFilterParams(filters)}`);
}

// ── M7: Top Dropped Insurances ──
export async function fetchTopDropped(filters) {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generateTopDropped(filters);
  }
  return apiFetch(`/dashboard/top-dropped?${buildFilterParams(filters)}`);
}

// ── M8: Initiation Source ──
export async function fetchInitiationSource(filters) {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generateInitiationSource(filters);
  }
  return apiFetch(`/dashboard/initiation-source?${buildFilterParams(filters)}`);
}

// ── M9: Claim Status Completion Rate ──
export async function fetchClaimCompletion(filters) {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generateClaimCompletion(filters);
  }
  return apiFetch(`/dashboard/claim-completion?${buildFilterParams(filters)}`);
}

// ── M10: Reattempt Outcome Funnel ──
export async function fetchReattemptFunnel(filters) {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generateReattemptFunnel(filters);
  }
  return apiFetch(`/dashboard/reattempt-funnel?${buildFilterParams(filters)}`);
}

// ── M11: First Attempt Success Rate ──
export async function fetchFirstAttemptRate(filters) {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generateFirstAttemptRate(filters);
  }
  return apiFetch(
    `/dashboard/first-attempt-rate?${buildFilterParams(filters)}`,
  );
}

// ── M12: Top Incomplete Steps ──
export async function fetchIncompleteSteps(filters) {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generateIncompleteSteps(filters);
  }
  return apiFetch(`/dashboard/incomplete-steps?${buildFilterParams(filters)}`);
}

// ── M13: Transcription Queue Length ──
export async function fetchTranscriptionQueue() {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generateTranscriptionQueue();
  }
  return apiFetch("/dashboard/transcription-queue");
}

// ── M14: Avg Transcription Latency ──
export async function fetchTranscriptionLatency(filters) {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generateTranscriptionLatency(filters);
  }
  return apiFetch(
    `/dashboard/transcription-time?${buildFilterParams(filters)}`,
  );
}

// ── M15: Transcription API Usage ──
export async function fetchApiUsage(filters) {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generateApiUsage(filters);
  }
  return apiFetch(
    `/dashboard/transcription-api-usage?${buildFilterParams(filters)}`,
  );
}

// ── M16: Concurrent Peak Monitoring ──
export async function fetchConcurrentPeaks(filters) {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generateConcurrentPeaks(filters);
  }
  return apiFetch(`/dashboard/concurrent-peaks?${buildFilterParams(filters)}`);
}

// ── M17: Global System Error Rate ──
export async function fetchErrorRate(filters) {
  if (USE_MOCK) {
    await mockDelay();
    return mock.generateErrorRate(filters);
  }
  return apiFetch(`/dashboard/error-rate?${buildFilterParams(filters)}`);
}
