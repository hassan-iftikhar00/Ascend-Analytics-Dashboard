import { useConcurrentPeaks } from "../../../hooks/useDashboardData";
import { MetricCard } from "../../ui";
import { BarChart } from "../../charts";
import { COLORS, THRESHOLDS } from "../../../config/constants";
import { formatNumber } from "../../../utils/formatters";

export default function ConcurrentPeaksCard() {
  const { data, isLoading, error } = useConcurrentPeaks();

  const chartData = (data?.data ?? []).map((d) => ({
    label: d.hour,
    Concurrent: d.value,
    ConcurrentColor: d.isPeak ? COLORS.danger : COLORS.primary,
  }));

  return (
    <MetricCard
      title="M16 — Concurrent Peak Monitoring"
      subtitle={
        data
          ? `Peak: ${formatNumber(data.peakValue)} at ${data.peakHour}`
          : "Hourly concurrency"
      }
      loading={isLoading}
      error={error}
    >
      <div style={{ height: 240 }}>
        <BarChart
          data={chartData}
          keys={["Concurrent"]}
          indexBy="label"
          yLabel="Concurrent"
          colors={({ data: d }) => d.ConcurrentColor}
          enableLabel={false}
          axisBottomTickRotation={-45}
          markers={[
            {
              axis: "y",
              value: data?.threshold ?? 900,
              lineStyle: {
                stroke: COLORS.danger,
                strokeWidth: 2,
                strokeDasharray: "6 4",
              },
              legend: `Capacity: ${data?.threshold ?? 900}`,
              legendPosition: "bottom-left",
              textStyle: { fontSize: 10, fill: COLORS.danger },
            },
          ]}
        />
      </div>
    </MetricCard>
  );
}
