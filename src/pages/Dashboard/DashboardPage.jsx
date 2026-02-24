import { TelephonySection } from "../../components/metrics/telephony";
import { WorkflowSection } from "../../components/metrics/workflow";
import { InfrastructureSection } from "../../components/metrics/infrastructure";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Executive Analytics Hub
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Real-time monitoring of 17 core IVR metrics across telephony,
          workflow, and infrastructure.
        </p>
      </div>

      {/* Section I: Telephony M1-M7 */}
      <TelephonySection />

      {/* Section II: Workflow M8-M12 */}
      <WorkflowSection />

      {/* Section III: Infrastructure M13-M17 */}
      <InfrastructureSection />
    </div>
  );
}
