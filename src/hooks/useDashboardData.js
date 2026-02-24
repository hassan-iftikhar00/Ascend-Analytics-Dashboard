/**
 * TanStack Query hooks for all 17 dashboard metrics
 */
import { useQuery } from "@tanstack/react-query";
import { useGlobalFilters } from "./useGlobalFilters";
import { REFRESH_INTERVALS } from "../config/constants";
import * as dashboardApi from "../services/dashboardApi";

// Helper to create consistent query options
function dashboardQuery(key, fetchFn, filters, options = {}) {
  return {
    queryKey: [
      "dashboard",
      key,
      {
        from: filters.dateRange?.from?.toISOString(),
        to: filters.dateRange?.to?.toISOString(),
        insurance: filters.insurance,
        practice: filters.practice,
      },
    ],
    queryFn: () => fetchFn(filters),
    staleTime: REFRESH_INTERVALS.DASHBOARD_STALE,
    ...options,
  };
}

// ── M1: Total Calls Initiated ──
export function useTotalCalls() {
  const { filters } = useGlobalFilters();
  return useQuery(
    dashboardQuery("totalCalls", dashboardApi.fetchTotalCalls, filters),
  );
}

// ── M2: Successful Connection Rate ──
export function useConnectionRate() {
  const { filters } = useGlobalFilters();
  return useQuery(
    dashboardQuery("connectionRate", dashboardApi.fetchConnectionRate, filters),
  );
}

// ── M3: Call Drop Rate ──
export function useDropRate() {
  const { filters } = useGlobalFilters();
  return useQuery(
    dashboardQuery("dropRate", dashboardApi.fetchDropRate, filters),
  );
}

// ── M4: Peak Calling Hours ──
export function usePeakHours() {
  const { filters } = useGlobalFilters();
  return useQuery(
    dashboardQuery("peakHours", dashboardApi.fetchPeakHours, filters),
  );
}

// ── M5: Active Calls (Real-Time) ──
export function useActiveCalls() {
  return useQuery({
    queryKey: ["dashboard", "activeCalls"],
    queryFn: dashboardApi.fetchActiveCalls,
    refetchInterval: REFRESH_INTERVALS.ACTIVE_CALLS,
    staleTime: 0,
  });
}

// ── M6: Call Duration ──
export function useCallDuration() {
  const { filters } = useGlobalFilters();
  return useQuery(
    dashboardQuery("callDuration", dashboardApi.fetchCallDuration, filters),
  );
}

// ── M7: Top Dropped Insurances ──
export function useTopDropped() {
  const { filters } = useGlobalFilters();
  return useQuery(
    dashboardQuery("topDropped", dashboardApi.fetchTopDropped, filters),
  );
}

// ── M8: Initiation Source ──
export function useInitiationSource() {
  const { filters } = useGlobalFilters();
  return useQuery(
    dashboardQuery(
      "initiationSource",
      dashboardApi.fetchInitiationSource,
      filters,
    ),
  );
}

// ── M9: Claim Status Completion Rate ──
export function useClaimCompletion() {
  const { filters } = useGlobalFilters();
  return useQuery(
    dashboardQuery(
      "claimCompletion",
      dashboardApi.fetchClaimCompletion,
      filters,
    ),
  );
}

// ── M10: Reattempt Outcome Funnel ──
export function useReattemptFunnel() {
  const { filters } = useGlobalFilters();
  return useQuery(
    dashboardQuery(
      "reattemptFunnel",
      dashboardApi.fetchReattemptFunnel,
      filters,
    ),
  );
}

// ── M11: First Attempt Success Rate ──
export function useFirstAttemptRate() {
  const { filters } = useGlobalFilters();
  return useQuery(
    dashboardQuery(
      "firstAttemptRate",
      dashboardApi.fetchFirstAttemptRate,
      filters,
    ),
  );
}

// ── M12: Top Incomplete Steps ──
export function useIncompleteSteps() {
  const { filters } = useGlobalFilters();
  return useQuery(
    dashboardQuery(
      "incompleteSteps",
      dashboardApi.fetchIncompleteSteps,
      filters,
    ),
  );
}

// ── M13: Transcription Queue Length ──
export function useTranscriptionQueue() {
  return useQuery({
    queryKey: ["dashboard", "transcriptionQueue"],
    queryFn: dashboardApi.fetchTranscriptionQueue,
    refetchInterval: REFRESH_INTERVALS.REAL_TIME_METRICS,
    staleTime: 0,
  });
}

// ── M14: Avg Transcription Latency ──
export function useTranscriptionLatency() {
  const { filters } = useGlobalFilters();
  return useQuery(
    dashboardQuery(
      "transcriptionTime",
      dashboardApi.fetchTranscriptionLatency,
      filters,
    ),
  );
}

// ── M15: Transcription API Usage ──
export function useApiUsage() {
  const { filters } = useGlobalFilters();
  return useQuery(
    dashboardQuery("apiUsage", dashboardApi.fetchApiUsage, filters),
  );
}

// ── M16: Concurrent Peak Monitoring ──
export function useConcurrentPeaks() {
  const { filters } = useGlobalFilters();
  return useQuery(
    dashboardQuery(
      "concurrentPeaks",
      dashboardApi.fetchConcurrentPeaks,
      filters,
    ),
  );
}

// ── M17: Global System Error Rate ──
export function useErrorRate() {
  const { filters } = useGlobalFilters();
  return useQuery(
    dashboardQuery("errorRate", dashboardApi.fetchErrorRate, filters),
  );
}
