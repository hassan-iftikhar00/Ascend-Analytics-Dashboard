import { useErrorRate } from "../../../hooks/useDashboardData";
import { KpiCard, MetricCard } from "../../ui";
import { LineChart, DonutChart } from "../../charts";
import { THRESHOLDS, COLORS } from "../../../config/constants";
import { formatNumber } from "../../../utils/formatters";
import { RiAlertLine } from "@remixicon/react";

export default function ErrorRateCard() {
  const { data, isLoading, error } = useErrorRate();

  const lineData = data?.trendData
    ? [
        {
          id: "Error %",
          data: data.trendData.map((d) => ({ x: d.date, y: d.value })),
        },
      ]
    : [];

  const donutData =
    data?.byCategory?.map((c) => ({
      id: c.category,
      label: c.category,
      value: c.count,
    })) ?? [];

  const alerting = data?.current > THRESHOLDS.ERROR_RATE.warning;

  return (
    <div className="flex flex-col gap-4">
      <KpiCard
        title="Global Error Rate"
        value={data ? `${data.current}%` : "—"}
        subtitle={
          data ? `${formatNumber(data.totalErrors)} total errors` : undefined
        }
        trend={data?.trend ? Number(data.trend) : undefined}
        icon={RiAlertLine}
        loading={isLoading}
        className={alerting ? "border-red-300 bg-red-50/30" : ""}
      />

      <MetricCard
        title="M17 — Error Rate Trend & Breakdown"
        subtitle="Error rate over time + category distribution"
        loading={isLoading}
        error={error}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Trend line */}
          <div style={{ height: 200 }}>
            <LineChart
              data={lineData}
              yLabel="%"
              yFormat={(v) => `${v}%`}
              colors={[alerting ? COLORS.danger : COLORS.warning]}
              enableArea
              enablePoints={lineData[0]?.data?.length <= 14}
              axisBottomTickRotation={-45}
            />
          </div>

          {/* Category donut */}
          <div style={{ height: 200 }}>
            <DonutChart
              data={donutData}
              colors={COLORS.chart}
              innerRadius={0.5}
              enableArcLinkLabels
              enableArcLabels={false}
              margin={{ top: 10, right: 80, bottom: 10, left: 80 }}
              valueFormat={(v) => formatNumber(v)}
            />
          </div>
        </div>
      </MetricCard>
    </div>
  );
}
