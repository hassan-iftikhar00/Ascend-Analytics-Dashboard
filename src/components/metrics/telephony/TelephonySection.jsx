import { ErrorBoundary } from "../../ui";
import TotalCallsCard from "./TotalCallsCard";
import ConnectionRateCard from "./ConnectionRateCard";
import DropRateCard from "./DropRateCard";
import PeakHoursCard from "./PeakHoursCard";
import ActiveCallsCard from "./ActiveCallsCard";
import CallDurationCard from "./CallDurationCard";
import TopDroppedCard from "./TopDroppedCard";

export default function TelephonySection() {
  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        I. Critical Telephony &amp; Success KPIs
      </h3>

      {/* Row 1: KPI summary cards — 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <ErrorBoundary>
          <TotalCallsCard />
        </ErrorBoundary>
        <ErrorBoundary>
          <ConnectionRateCard />
        </ErrorBoundary>
        <ErrorBoundary>
          <DropRateCard />
        </ErrorBoundary>
      </div>

      {/* Row 2: Peak Hours heatmap (full width) */}
      <div className="mb-4">
        <ErrorBoundary>
          <PeakHoursCard />
        </ErrorBoundary>
      </div>

      {/* Row 3: Active Calls + Duration + Top Dropped */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ErrorBoundary>
          <ActiveCallsCard />
        </ErrorBoundary>
        <ErrorBoundary>
          <CallDurationCard />
        </ErrorBoundary>
        <ErrorBoundary>
          <TopDroppedCard />
        </ErrorBoundary>
      </div>
    </section>
  );
}
