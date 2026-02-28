import { usePeakHours } from "../../../hooks/useDashboardData";
import { MetricCard } from "../../ui";
import { HeatmapChart } from "../../charts";

export default function PeakHoursCard() {
  const { data, isLoading, error } = usePeakHours();

  return (
    <MetricCard
      title="M4 - Peak Calling Hours"
      subtitle="Call volume by day of week × hour (7AM–8PM)"
      loading={isLoading}
      error={error}
      minHeight={340}
    >
      <div style={{ height: 280 }}>
        <HeatmapChart
          data={data ?? []}
          colors={{
            type: "sequential",
            scheme: "greens",
          }}
          margin={{ top: 30, right: 24, bottom: 10, left: 52 }}
          valueFormat={(v) => `${v} calls`}
        />
      </div>
    </MetricCard>
  );
}
