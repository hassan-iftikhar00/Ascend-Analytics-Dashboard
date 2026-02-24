import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchOperationsLogs } from "../services/operationsApi";

/**
 * TanStack Query hook for paginated operations logs.
 * Keeps previous data while new page loads for smooth UX.
 */
export function useOperationsData({
  page = 1,
  pageSize = 50,
  sort,
  dir,
  filters,
  search,
}) {
  return useQuery({
    queryKey: ["operations", { page, pageSize, sort, dir, filters, search }],
    queryFn: () =>
      fetchOperationsLogs({ page, pageSize, sort, dir, filters, search }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
