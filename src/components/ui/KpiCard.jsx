import { formatTrend } from "../../utils/formatters";

export default function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  loading = false,
  className = "",
}) {
  const isPositiveTrend = trend > 0;
  const isNegativeTrend = trend < 0;

  if (loading) {
    return (
      <div
        className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
          <div className="h-8 w-20 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 card-hover ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        {Icon && <Icon size={16} className="text-gray-400" />}
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-gray-900 animate-count-up">
        {value}
      </p>

      {/* Trend + subtitle */}
      <div className="flex items-center gap-2 mt-1.5">
        {trend != null && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${
              isPositiveTrend
                ? "text-green-700 bg-green-50"
                : isNegativeTrend
                  ? "text-red-700 bg-red-50"
                  : "text-gray-600 bg-gray-50"
            }`}
          >
            {isPositiveTrend && "↑"}
            {isNegativeTrend && "↓"}
            {formatTrend(trend)}
          </span>
        )}
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
      </div>
    </div>
  );
}
