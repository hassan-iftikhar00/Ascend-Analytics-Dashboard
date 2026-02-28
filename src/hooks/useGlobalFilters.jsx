import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { subHours, subDays } from "date-fns";

const FilterContext = createContext(null);

function getDefaultDateRange() {
  const now = new Date();
  return {
    from: subDays(now, 90),
    to: now,
    preset: "90d",
  };
}

const initialFilters = {
  dateRange: getDefaultDateRange(),
  insurance: [], // empty = all
  practice: [], // empty = all
  dnis: [], // empty = all
  callType: [], // empty = all
};

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateDateRange = useCallback((preset) => {
    const now = new Date();
    let from;
    switch (preset) {
      case "24h":
        from = subHours(now, 24);
        break;
      case "7d":
        from = subDays(now, 7);
        break;
      case "30d":
        from = subDays(now, 30);
        break;
      case "90d":
        from = subDays(now, 90);
        break;
      default:
        from = subHours(now, 24);
    }
    setFilters((prev) => ({
      ...prev,
      dateRange: { from, to: now, preset },
    }));
  }, []);

  const setCustomDateRange = useCallback((from, to) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { from, to, preset: "custom" },
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.insurance.length > 0) count++;
    if (filters.practice.length > 0) count++;
    if (filters.dnis.length > 0) count++;
    if (filters.callType.length > 0) count++;
    return count;
  }, [filters]);

  const value = useMemo(
    () => ({
      filters,
      updateFilter,
      updateDateRange,
      setCustomDateRange,
      resetFilters,
      activeFilterCount,
    }),
    [
      filters,
      updateFilter,
      updateDateRange,
      setCustomDateRange,
      resetFilters,
      activeFilterCount,
    ],
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useGlobalFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useGlobalFilters must be used within a FilterProvider");
  }
  return context;
}
