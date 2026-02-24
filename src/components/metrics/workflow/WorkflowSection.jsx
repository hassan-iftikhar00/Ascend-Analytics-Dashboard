import { ErrorBoundary } from "../../ui";
import InitiationSourceCard from "./InitiationSourceCard";
import ClaimCompletionCard from "./ClaimCompletionCard";
import ReattemptFunnelCard from "./ReattemptFunnelCard";
import FirstAttemptCard from "./FirstAttemptCard";
import IncompleteStepsCard from "./IncompleteStepsCard";

export default function WorkflowSection() {
  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        II. IVR Workflow &amp; Automation ROI
      </h3>

      {/* Row 1: Source + Completion + First Attempt */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <ErrorBoundary>
          <InitiationSourceCard />
        </ErrorBoundary>
        <ErrorBoundary>
          <ClaimCompletionCard />
        </ErrorBoundary>
        <ErrorBoundary>
          <FirstAttemptCard />
        </ErrorBoundary>
      </div>

      {/* Row 2: Funnel + Incomplete Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ErrorBoundary>
          <ReattemptFunnelCard />
        </ErrorBoundary>
        <ErrorBoundary>
          <IncompleteStepsCard />
        </ErrorBoundary>
      </div>
    </section>
  );
}
