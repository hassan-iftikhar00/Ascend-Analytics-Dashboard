import OperationsTable from "./OperationsTable";
import { ErrorBoundary } from "../../components/ui";

export default function OperationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Operational Data Portal
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Granular auditing interface with virtualized 100k+ row data grid.
        </p>
      </div>

      <ErrorBoundary>
        <OperationsTable />
      </ErrorBoundary>
    </div>
  );
}
