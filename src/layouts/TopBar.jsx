import { useLocation } from "react-router-dom";
import { RiLiveLine, RiFilter3Line, RiRefreshLine } from "@remixicon/react";
import { useGlobalFilters } from "../hooks/useGlobalFilters";
import FilterDropdown from "../components/ui/FilterDropdown";
import {
  INSURANCES,
  PRACTICES,
  DNIS_LIST,
  CALL_TYPES,
  DATE_PRESETS,
} from "../config/constants";

export default function TopBar() {
  const location = useLocation();
  const {
    filters,
    updateFilter,
    updateDateRange,
    resetFilters,
    activeFilterCount,
  } = useGlobalFilters();

  // Page title based on route
  const pageTitle = location.pathname.includes("/operations")
    ? "Operations Data"
    : location.pathname.includes("/settings")
      ? "Settings"
      : "Dashboard";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Live badge + page context */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-live" />
          <span className="text-xs font-medium text-green-700">LIVE</span>
        </div>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm font-medium text-gray-700">{pageTitle}</span>
      </div>

      {/* Right: Filters */}
      <div className="flex items-center gap-3">
        {/* Date Range */}
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-200 p-0.5">
          {DATE_PRESETS.filter((p) => p.value !== "custom").map((preset) => (
            <button
              key={preset.value}
              onClick={() => updateDateRange(preset.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filters.dateRange.preset === preset.value
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <span className="text-gray-300">|</span>

        {/* Filter dropdowns */}
        <FilterDropdown
          label="Insurance"
          options={INSURANCES}
          selected={filters.insurance}
          onChange={(val) => updateFilter("insurance", val)}
        />
        <FilterDropdown
          label="Practice"
          options={PRACTICES}
          selected={filters.practice}
          onChange={(val) => updateFilter("practice", val)}
        />
        <FilterDropdown
          label="DNIS"
          options={DNIS_LIST}
          selected={filters.dnis}
          onChange={(val) => updateFilter("dnis", val)}
        />
        <FilterDropdown
          label="Call Type"
          options={CALL_TYPES}
          selected={filters.callType}
          onChange={(val) => updateFilter("callType", val)}
        />

        {/* Reset */}
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <RiRefreshLine size={14} />
            Reset ({activeFilterCount})
          </button>
        )}
      </div>
    </header>
  );
}
