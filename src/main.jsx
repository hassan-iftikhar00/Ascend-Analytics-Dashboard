import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FilterProvider } from "./hooks/useGlobalFilters";
import { ConnectionProvider } from "./components/ConnectionAlert";
import "./index.css";
import App from "./App.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minute
      gcTime: 5 * 60_000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry when the DB is down (503) - surface the alert immediately
        if (error?.message?.includes("503")) return false;
        return failureCount < 2;
      },
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider>
        <FilterProvider>
          <App />
        </FilterProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  </StrictMode>,
);
