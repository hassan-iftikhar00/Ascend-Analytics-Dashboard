import { COLORS } from "../../config/constants";

/**
 * Radial gauge chart with 3-zone coloring (green/yellow/red)
 * @param {number} value - Current value (0-100)
 * @param {number} greenThreshold - Value above which is green
 * @param {number} yellowThreshold - Value above which is yellow (below green)
 * @param {string} label - Center label
 * @param {number} size - SVG size in px
 */
export default function GaugeChart({
  value = 0,
  greenThreshold = 95,
  yellowThreshold = 90,
  label = "",
  size = 160,
  loading = false,
}) {
  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="animate-pulse w-full h-full rounded-full bg-gray-100" />
      </div>
    );
  }

  const center = size / 2;
  const radius = size / 2 - 16;
  const strokeWidth = 14;
  const clampedValue = Math.max(0, Math.min(100, value));
  const valueAngle = (clampedValue / 100) * Math.PI;

  // Color based on thresholds
  let color = COLORS.danger;
  if (clampedValue >= greenThreshold) color = COLORS.success;
  else if (clampedValue >= yellowThreshold) color = COLORS.warning;

  // Arc path helper
  function arcPath(startA, endA, r) {
    const x1 = center + r * Math.cos(startA);
    const y1 = center + r * Math.sin(startA);
    const x2 = center + r * Math.cos(endA);
    const y2 = center + r * Math.sin(endA);
    const largeArc = endA - startA > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  // Background arc (180°, bottom half)
  const bgArc = arcPath(Math.PI, 2 * Math.PI, radius);
  // Value arc
  const valArc = arcPath(Math.PI, Math.PI + valueAngle, radius);

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg
        width={size}
        height={size * 0.6}
        viewBox={`0 0 ${size} ${size * 0.65}`}
      >
        {/* Background arc */}
        <path
          d={bgArc}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={valArc}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.6s ease",
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
        <span className="text-xl font-bold" style={{ color }}>
          {clampedValue.toFixed(1)}%
        </span>
        {label && (
          <span className="text-[10px] text-gray-400 mt-0.5">{label}</span>
        )}
      </div>
    </div>
  );
}
