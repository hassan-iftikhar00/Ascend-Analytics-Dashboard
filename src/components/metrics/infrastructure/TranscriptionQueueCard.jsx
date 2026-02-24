import { useTranscriptionQueue } from "../../../hooks/useDashboardData";
import { KpiCard, ThresholdBar, MetricCard } from "../../ui";
import { LineChart } from "../../charts";
import { THRESHOLDS } from "../../../config/constants";
import { RiStackLine } from "@remixicon/react";

export default function TranscriptionQueueCard() {
  const { data, isLoading, error } = useTranscriptionQueue();

  const lineData = data?.trendData
    ? [
        {
          id: "Queue",
          data: data.trendData.map((d) => ({ x: d.hour, y: d.value })),
        },
      ]
    : [];

  const alerting = data?.current > THRESHOLDS.TRANSCRIPTION_QUEUE.warning;

  return (
    <MetricCard
      title="M13 — Transcription Queue Length"
      subtitle="Items pending processing — refreshes every 30s"
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
        {/* Current queue stats */}
        <div className="flex items-center gap-6">
          <div>
            <p
              className={`text-3xl font-bold ${alerting ? "text-red-600" : "text-gray-900"}`}
            >
              {data?.current ?? "—"}
            </p>
            <p className="text-xs text-gray-400">items in queue</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-800">
              {data?.avgWaitTime ?? "—"}s
            </p>
            <p className="text-xs text-gray-400">avg wait time</p>
          </div>
        </div>

        {data && (
          <ThresholdBar
            value={data.current}
            max={THRESHOLDS.TRANSCRIPTION_QUEUE.warning * 1.5}
            label="Queue Capacity"
            warningThreshold={0.67}
          />
        )}

        <div style={{ height: 160 }}>
          <LineChart
            data={lineData}
            yLabel="Items"
            colors={[alerting ? "#ef4444" : "#3b82f6"]}
            enableArea
            enablePoints={false}
            axisBottomTickRotation={-45}
          />
        </div>
      </div>
    </MetricCard>
  );
}
