import { useInitiationSource } from "../../../hooks/useDashboardData";
import { MetricCard } from "../../ui";
import { DonutChart } from "../../charts";
import { COLORS } from "../../../config/constants";
import { formatNumber } from "../../../utils/formatters";

export default function InitiationSourceCard() {
  const { data, isLoading, error } = useInitiationSource();

  const donutData = data?.data ?? [];

  return (
    <MetricCard
      title="M8 - Initiation Source"
      subtitle="Bot vs. Human call origination"
      loading={isLoading}
      error={error}
    >
      <div className="flex items-center gap-4">
        <div style={{ height: 200, width: "55%" }}>
          <DonutChart
            data={donutData}
            colors={[COLORS.primary, COLORS.warning]}
            innerRadius={0.55}
            enableArcLinkLabels={false}
            enableArcLabels
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            valueFormat={(v) => formatNumber(v)}
          />
        </div>
        <div className="flex-1 space-y-3">
          {donutData.map((d, i) => (
            <div key={d.id} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: i === 0 ? COLORS.primary : COLORS.warning,
                }}
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">{d.label}</p>
                <p className="text-xs text-gray-400">
                  {formatNumber(d.value)} ({d.percent}%)
                </p>
              </div>
            </div>
          ))}
          {data && (
            <p className="text-xs text-gray-400 pt-1 border-t border-gray-100">
              Total: {formatNumber(data.total)}
            </p>
          )}
        </div>
      </div>
    </MetricCard>
  );
}
