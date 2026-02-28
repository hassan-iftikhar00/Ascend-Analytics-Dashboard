import { useQuery } from "@tanstack/react-query";
import { fetchFilterOptions } from "../services/dashboardApi";

/**
 * Fetches filter dropdown options from the database.
 * Caches for 5 minutes since options rarely change.
 */
export function useFilterOptions() {
  return useQuery({
    queryKey: ["filter-options"],
    queryFn: fetchFilterOptions,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
