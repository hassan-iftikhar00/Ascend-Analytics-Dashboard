import { useState, useEffect, useCallback, useContext } from "react";
import ConnectionCtx from "../contexts/ConnectionCtx";

/**
 * Provides a shared "dbDown" flag that any component can read.
 * The flag is set when the backend returns 503 (SQL Server unreachable)
 * and cleared when a health-check succeeds.
 */
export function ConnectionProvider({ children }) {
  const [dbDown, setDbDown] = useState(false);

  // Poll /api/health when the DB is down to auto-clear the banner
  useEffect(() => {
    if (!dbDown) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/health", {
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.db === "connected") setDbDown(false);
        }
      } catch {
        /* still down */
      }
    }, 15_000); // check every 15 s
    return () => clearInterval(id);
  }, [dbDown]);

  const markDown = useCallback(() => setDbDown(true), []);
  const markUp = useCallback(() => setDbDown(false), []);

  // Listen for the custom event dispatched by apiFetch on 503
  useEffect(() => {
    const handler = () => setDbDown(true);
    window.addEventListener("db-unavailable", handler);
    return () => window.removeEventListener("db-unavailable", handler);
  }, []);

  return (
    <ConnectionCtx.Provider value={{ dbDown, markDown, markUp }}>
      {children}
    </ConnectionCtx.Provider>
  );
}

/**
 * Sticky banner shown at the top of the page when the database is unreachable.
 */
export default function ConnectionAlert() {
  const { dbDown } = useContext(ConnectionCtx);
  const [dismissed, setDismissed] = useState(false);

  // Track previous dbDown to auto-undismiss (React-safe pattern)
  const [prevDbDown, setPrevDbDown] = useState(false);
  if (dbDown !== prevDbDown) {
    setPrevDbDown(dbDown);
    if (dbDown) setDismissed(false);
  }

  if (!dbDown || dismissed) return null;

  return (
    <div className="sticky top-0 z-100 flex items-center justify-between gap-3 bg-amber-50 border-b border-amber-300 px-5 py-3 text-amber-900 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Warning icon */}
        <svg
          className="h-5 w-5 shrink-0 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold">
            Database connection unavailable
          </p>
          <p className="text-xs text-amber-700">
            Unable to reach the SQL Server - please ensure you are connected to
            the company VPN. Data will refresh automatically once the connection
            is restored.
          </p>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-1 hover:bg-amber-200/60 transition-colors"
        aria-label="Dismiss"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
