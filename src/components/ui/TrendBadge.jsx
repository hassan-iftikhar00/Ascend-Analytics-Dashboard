import { formatTrend } from "../../utils/formatters";

export default function TrendBadge({ value, invertColors = false }) {
  if (value == null) return null;

  const isPositive = value >= 0;
  // invertColors: for metrics where "up is bad" (like drop rate)
  const goodDirection = invertColors ? !isPositive : isPositive;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
        goodDirection ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
      }`}
    >
      {isPositive ? "↑" : "↓"}
      {formatTrend(value)}
    </span>
  );
}
