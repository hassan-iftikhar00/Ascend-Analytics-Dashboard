import {
  THRESHOLDS,
  REFRESH_INTERVALS,
  APP_NAME,
} from "../../config/constants";

const thresholdEntries = [
  {
    key: "CONNECTION_RATE",
    label: "Connection Rate",
    unit: "%",
    desc: "Green ≥ green, Yellow ≥ yellow, Red below",
    fields: ["green", "yellow"],
  },
  {
    key: "DROP_RATE",
    label: "Call Drop Rate",
    unit: "%",
    desc: "Warning when above threshold",
    fields: ["warning"],
  },
  {
    key: "FIRST_ATTEMPT",
    label: "First Attempt Success",
    unit: "%",
    desc: "Warning when below threshold",
    fields: ["warning"],
  },
  {
    key: "CLAIM_COMPLETION",
    label: "Claim Completion",
    unit: "%",
    desc: "Warning when below threshold",
    fields: ["warning"],
  },
  {
    key: "TRANSCRIPTION_QUEUE",
    label: "Transcription Queue",
    unit: "items",
    desc: "Alert when queue exceeds this",
    fields: ["warning"],
  },
  {
    key: "TRANSCRIPTION_P90",
    label: "Transcription Latency P90",
    unit: "s",
    desc: "Alert when P90 exceeds this",
    fields: ["warning"],
  },
  {
    key: "CAPACITY",
    label: "Capacity Utilization",
    unit: "%",
    desc: "Alert when utilization exceeds this",
    fields: ["warning"],
  },
  {
    key: "ERROR_RATE",
    label: "Global Error Rate",
    unit: "%",
    desc: "Alert when error rate exceeds this",
    fields: ["warning"],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure thresholds, alert preferences, and system parameters.
        </p>
      </div>

      {/* System info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          System Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400">Application</p>
            <p className="font-medium text-gray-700">{APP_NAME}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Refresh Interval</p>
            <p className="font-medium text-gray-700">
              {REFRESH_INTERVALS.ACTIVE_CALLS / 1000}s (real-time)
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Stale Time</p>
            <p className="font-medium text-gray-700">
              {REFRESH_INTERVALS.DASHBOARD_STALE / 1000}s
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Data Mode</p>
            <p className="font-medium text-amber-600">Mock (Development)</p>
          </div>
        </div>
      </div>

      {/* Threshold configuration (read-only view) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Threshold Configuration
        </h3>
        <div className="space-y-3">
          {thresholdEntries.map((entry) => {
            const values = THRESHOLDS[entry.key];
            return (
              <div
                key={entry.key}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {entry.label}
                  </p>
                  <p className="text-[11px] text-gray-400">{entry.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  {entry.fields.map((f) => (
                    <div key={f} className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 uppercase">
                        {f}:
                      </span>
                      <span className="text-sm font-semibold text-gray-800 tabular-nums">
                        {values[f]}
                        {entry.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-gray-400 mt-4">
          Thresholds are defined in{" "}
          <code className="text-gray-500">config/constants.js</code>. Editing
          from UI will be available once backend API is connected.
        </p>
      </div>
    </div>
  );
}
