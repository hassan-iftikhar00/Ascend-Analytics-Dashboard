import { useCallDuration } from "../../../hooks/useDashboardData";
import { MetricCard } from "../../ui";
import { LineChart } from "../../charts";
import { formatDurationShort } from "../../../utils/formatters";

export default function CallDurationCard() {
  const { data, isLoading, error } = useCallDuration();

  const lineData = data?.trendData
    ? [
        {
          id: "Avg Duration",
          data: data.trendData.map((d) => ({ x: d.date, y: d.value })),
        },
      ]
    : [];

  const bp = data?.boxPlot;

  return (
    <MetricCard
      title="M6 — Call Duration Analysis"
      subtitle="Duration distribution with P90/P95 indicators"
      loading={isLoading}
      error={error}
    >
      <div className="flex flex-col gap-4">
        {/* Box Plot summary stats */}
        {bp && (
          <div className="grid grid-cols-5 gap-3 text-center">
            {[
              { label: "Min", val: bp.min },
              { label: "P25", val: bp.p25 },
              { label: "Median", val: bp.median },
              { label: "P90", val: bp.p90, highlight: true },
              { label: "P95", val: bp.p95, highlight: true },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-lg py-2 px-1 ${
                  s.highlight
                    ? "bg-amber-50 border border-amber-200"
                    : "bg-gray-50"
                }`}
              >
                <p className="text-[10px] text-gray-400 uppercase">{s.label}</p>
                <p
                  className={`text-sm font-bold ${s.highlight ? "text-amber-600" : "text-gray-700"}`}
                >
                  {formatDurationShort(s.val)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Trend line */}
        <div style={{ height: 180 }}>
          <LineChart
            data={lineData}
            yLabel="sec"
            colors={["#8b5cf6"]}
            enableArea
            enablePoints={lineData[0]?.data?.length <= 14}
            axisBottomTickRotation={-45}
          />
        </div>
      </div>
    </MetricCard>
  );
}
