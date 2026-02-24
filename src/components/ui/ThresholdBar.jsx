export default function ThresholdBar({
  value,
  max,
  label,
  warningThreshold = 0.9,
  className = "",
}) {
  const percent = Math.min((value / max) * 100, 100);
  const isWarning = percent >= warningThreshold * 100;
  const isCritical = percent >= 95;

  const barColor = isCritical
    ? "bg-red-500"
    : isWarning
      ? "bg-amber-500"
      : "bg-blue-500";

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">{label}</span>
          <span className="text-xs font-medium text-gray-700">
            {value} / {max}
          </span>
        </div>
      )}
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {isWarning && (
        <p className="text-[10px] text-red-500 mt-0.5 font-medium">
          ⚠ Capacity Alert ({percent.toFixed(0)}%)
        </p>
      )}
    </div>
  );
}
