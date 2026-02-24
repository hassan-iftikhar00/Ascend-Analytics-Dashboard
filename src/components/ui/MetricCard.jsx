import LoadingSpinner from "./LoadingSpinner";

/**
 * Wrapper card for chart-based metric panels.
 * Provides title, optional subtitle, loading/error states, and a consistent frame.
 */
export default function MetricCard({
  title,
  subtitle,
  children,
  loading = false,
  error,
  actions,
  className = "",
  minHeight = 280,
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 card-hover flex flex-col ${className}`}
      style={{ minHeight }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {subtitle && (
            <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Body */}
      <div className="flex-1 px-5 pb-4">
        {loading ? (
          <div className="flex items-center justify-center h-full min-h-50">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full min-h-50">
            <p className="text-xs text-red-500">Failed to load data</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
