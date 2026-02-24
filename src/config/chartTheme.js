import { COLORS } from "./constants";

// ── Shared Nivo chart theme ──
export const nivoTheme = {
  background: "transparent",
  text: {
    fontSize: 11,
    fill: "#6b7280",
  },
  axis: {
    domain: {
      line: { stroke: "#e5e7eb", strokeWidth: 1 },
    },
    legend: {
      text: { fontSize: 12, fill: "#374151", fontWeight: 500 },
    },
    ticks: {
      line: { stroke: "#e5e7eb", strokeWidth: 1 },
      text: { fontSize: 10, fill: "#9ca3af" },
    },
  },
  grid: {
    line: { stroke: "#f3f4f6", strokeWidth: 1 },
  },
  legends: {
    text: { fontSize: 11, fill: "#6b7280" },
  },
  tooltip: {
    container: {
      background: "#ffffff",
      fontSize: 12,
      borderRadius: 8,
      boxShadow:
        "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
      padding: "8px 12px",
      border: "1px solid #e5e7eb",
    },
  },
  crosshair: {
    line: {
      stroke: COLORS.primary,
      strokeWidth: 1,
      strokeOpacity: 0.35,
    },
  },
};

// ── Default chart colors ──
export const chartColors = COLORS.chart;

// ── Gauge colors ──
export const gaugeColors = COLORS.gauge;

// ── Heatmap colors ──
export const heatmapColors = COLORS.heatmap;
