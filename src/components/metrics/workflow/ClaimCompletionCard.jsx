import { useClaimCompletion } from "../../../hooks/useDashboardData";
import { GaugeChart, MetricCard } from "../../ui";
import { LineChart } from "../../charts";
import { THRESHOLDS } from "../../../config/constants";
import { formatNumber } from "../../../utils/formatters";

export default function ClaimCompletionCard() {
  const { data, isLoading, error } = useClaimCompletion();

  const lineData = data?.trendData
    ? [
        {
          id: "Completion %",
          data: data.trendData.map((d) => ({ x: d.date, y: d.value })),
        },
      ]
    : [];

  return (
    <MetricCard
      title="M9 - Claim Status Completion Rate"
      subtitle="End-to-end claim query success %"
      loading={isLoading}
      error={error}
    >
      <div className="flex flex-col gap-4">
        {/* Gauge + stats */}
        <div className="flex items-center gap-6">
          <GaugeChart
            value={data?.current ?? 0}
            greenThreshold={90}
            yellowThreshold={THRESHOLDS.CLAIM_COMPLETION.warning}
            label="Completion"
            size={130}
            loading={isLoading}
          />
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {data ? `${data.current}%` : "-"}
            </p>
            {data && (
              <p className="text-xs text-gray-400 mt-1">
                {formatNumber(data.completedCalls)} /{" "}
                {formatNumber(data.totalAttempted)} calls
              </p>
            )}
          </div>
        </div>

        {/* Trend */}
        <div style={{ height: 160 }}>
          <LineChart
            data={lineData}
            yLabel="%"
            yFormat={(v) => `${v}%`}
            colors={["#10b981"]}
            enableArea
            enablePoints={lineData[0]?.data?.length <= 14}
            axisBottomTickRotation={-45}
          />
        </div>
      </div>
    </MetricCard>
  );
}
