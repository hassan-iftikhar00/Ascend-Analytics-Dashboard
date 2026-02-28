import { useActiveCalls } from "../../../hooks/useDashboardData";
import { ThresholdBar, MetricCard } from "../../ui";
import { DonutChart } from "../../charts";
import { COLORS } from "../../../config/constants";
import { formatNumber } from "../../../utils/formatters";

export default function ActiveCallsCard() {
  const { data, isLoading, error } = useActiveCalls();

  const donutData =
    data?.breakdown?.map((seg) => ({
      id: seg.segment,
      label: seg.segment,
      value: seg.value,
    })) ?? [];

  return (
    <MetricCard
      title="M5 - Active Calls (Real-Time)"
      subtitle="Live call count with capacity gauge - refreshes every 30s"
      loading={isLoading}
      error={error}
      actions={
        <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-live" />
          Live
        </span>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Capacity bar */}
        {data && (
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <ThresholdBar
                value={data.total}
                max={data.capacity}
                label={`${formatNumber(data.total)} / ${formatNumber(data.capacity)} channels`}
                warningThreshold={0.85}
              />
            </div>
            <span className="text-lg font-bold text-gray-900 tabular-nums">
              {data.utilizationPercent}%
            </span>
          </div>
        )}

        {/* Donut breakdown */}
        <div style={{ height: 200 }}>
          <DonutChart
            data={donutData}
            colors={COLORS.chart}
            innerRadius={0.6}
            enableArcLinkLabels
            enableArcLabels={false}
            margin={{ top: 10, right: 100, bottom: 10, left: 100 }}
            valueFormat={(v) => formatNumber(v)}
          />
        </div>
      </div>
    </MetricCard>
  );
}
