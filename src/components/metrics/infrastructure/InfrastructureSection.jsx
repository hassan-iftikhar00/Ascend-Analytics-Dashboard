import { ErrorBoundary } from "../../ui";
import TranscriptionQueueCard from "./TranscriptionQueueCard";
import TranscriptionLatencyCard from "./TranscriptionLatencyCard";
import ApiUsageCard from "./ApiUsageCard";
import ConcurrentPeaksCard from "./ConcurrentPeaksCard";
import ErrorRateCard from "./ErrorRateCard";

export default function InfrastructureSection() {
  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        III. System Health &amp; Infrastructure
      </h3>

      {/* Row 1: Queue + Latency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ErrorBoundary>
          <TranscriptionQueueCard />
        </ErrorBoundary>
        <ErrorBoundary>
          <TranscriptionLatencyCard />
        </ErrorBoundary>
      </div>

      {/* Row 2: API Usage + Concurrent Peaks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ErrorBoundary>
          <ApiUsageCard />
        </ErrorBoundary>
        <ErrorBoundary>
          <ConcurrentPeaksCard />
        </ErrorBoundary>
      </div>

      {/* Row 3: Error Rate (full width) */}
      <div>
        <ErrorBoundary>
          <ErrorRateCard />
        </ErrorBoundary>
      </div>
    </section>
  );
}
