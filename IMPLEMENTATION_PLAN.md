# STRATEGIC IVR ANALYTICS & OPERATIONS PORTAL — IMPLEMENTATION PLAN

## 0. CURRENT STATE

| Item                              | Status       |
| --------------------------------- | ------------ |
| React 19 + Vite 7                 | ✅ Installed |
| Tailwind CSS 4                    | ✅ Installed |
| @microsoft/signalr                | ✅ Installed |
| @tanstack/react-query             | ✅ Installed |
| @tanstack/react-table v8          | ✅ Installed |
| @tanstack/react-virtual           | ✅ Installed |
| Nivo (bar, boxplot, heatmap, pie) | ✅ Installed |
| Tremor                            | ✅ Installed |
| React Router v7                   | ✅ Installed |
| Remix Icons                       | ✅ Installed |
| date-fns                          | ✅ Installed |
| Zod                               | ✅ Installed |

**App.jsx** is a placeholder Tailwind test. Everything else needs to be built.

---

## 1. FINAL FOLDER STRUCTURE

```
src/
├── main.jsx                          # Root mount + providers
├── App.jsx                           # Router setup
├── index.css                         # Tailwind + global styles
│
├── config/
│   ├── constants.js                  # App-wide constants (thresholds, colors, refresh intervals)
│   ├── chartTheme.js                 # Nivo/Tremor shared theme tokens
│   └── routes.js                     # Route definitions
│
├── layouts/
│   ├── RootLayout.jsx                # Sidebar + TopBar + <Outlet/>
│   ├── Sidebar.jsx                   # Left nav: Dashboard, Operations, Settings
│   └── TopBar.jsx                    # Global filters bar (date range, insurance, practice, DNIS, call type)
│
├── pages/
│   ├── Dashboard/
│   │   ├── DashboardPage.jsx         # Page 1 — Executive Analytics Hub
│   │   ├── sections/
│   │   │   ├── TelephonySection.jsx  # Metrics 1–7 grouping
│   │   │   ├── WorkflowSection.jsx   # Metrics 8–12 grouping
│   │   │   └── InfraSection.jsx      # Metrics 13–17 grouping
│   │   └── index.js                  # barrel export
│   │
│   ├── Operations/
│   │   ├── OperationsPage.jsx        # Page 2 — Operational Data Portal
│   │   ├── OperationsToolbar.jsx     # Column visibility, export CSV, search
│   │   └── index.js
│   │
│   └── Settings/
│       ├── SettingsPage.jsx          # Thresholds config, alert preferences
│       └── index.js
│
├── components/
│   ├── ui/                           # Reusable primitives
│   │   ├── KpiCard.jsx               # Numeric KPI with trend arrow
│   │   ├── GaugeChart.jsx            # Radial gauge (green/yellow/red thresholds)
│   │   ├── TrendBadge.jsx            # +0.4% / -2.1% colored badge
│   │   ├── ThresholdBar.jsx          # Capacity bar with alert zones
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── Tooltip.jsx               # Shared tooltip wrapper
│   │   └── FilterDropdown.jsx        # Reusable multi-select dropdown
│   │
│   ├── charts/                       # Chart wrapper components (thin Nivo/Tremor wrappers)
│   │   ├── LineChart.jsx             # Nivo ResponsiveLine
│   │   ├── BarChart.jsx              # Nivo ResponsiveBar
│   │   ├── StackedBarChart.jsx       # Nivo ResponsiveBar (stacked mode)
│   │   ├── HorizontalBarChart.jsx    # Nivo ResponsiveBar (horizontal)
│   │   ├── BoxPlotChart.jsx          # Nivo ResponsiveBoxPlot
│   │   ├── HeatmapChart.jsx          # Nivo ResponsiveHeatMap
│   │   ├── DonutChart.jsx            # Nivo ResponsivePie (inner radius)
│   │   ├── FunnelChart.jsx           # Custom SVG funnel for reattempts
│   │   └── GaugeRadial.jsx           # Custom SVG or Tremor gauge
│   │
│   └── metrics/                      # One component per metric (17 total)
│       │
│       │  ── I. Critical Telephony & Success KPI Suite ──
│       ├── TotalCallsInitiated.jsx           # M1  — KPI + Line
│       ├── SuccessfulConnectionRate.jsx      # M2  — Gauge + Line
│       ├── CallDropRate.jsx                  # M3  — Gauge + Bar
│       ├── PeakCallingHours.jsx              # M4  — Heatmap
│       ├── ActiveCallsRealTime.jsx           # M5  — Stacked Bar (30s refresh)
│       ├── CallDuration.jsx                  # M6  — Box Plot + Line (P90/P95)
│       ├── TopDroppedInsurances.jsx           # M7  — Horizontal Bar (top 5)
│       │
│       │  ── II. IVR Workflow & Automation ROI ──
│       ├── InitiationSource.jsx              # M8  — Donut (Bot vs Human)
│       ├── ClaimStatusCompletionRate.jsx     # M9  — Gauge + Line
│       ├── ReattemptOutcomeFunnel.jsx        # M10 — Funnel (Attempt 1→2→3)
│       ├── FirstAttemptSuccessRate.jsx       # M11 — KPI + Line
│       ├── TopIncompleteSteps.jsx            # M12 — Bar Chart
│       │
│       │  ── III. System Health & Infrastructure ──
│       ├── TranscriptionQueueLength.jsx      # M13 — KPI + Line
│       ├── AvgTranscriptionLatency.jsx       # M14 — Box Plot (P90)
│       ├── TranscriptionApiUsage.jsx         # M15 — Stacked Bar by Vendor
│       ├── ConcurrentPeakMonitoring.jsx      # M16 — Line + Alert Markers
│       └── GlobalSystemErrorRate.jsx         # M17 — KPI + Bar
│
├── hooks/
│   ├── useSignalR.js                 # SignalR connection manager + event bus
│   ├── useGlobalFilters.js           # Zustand/context for filter state
│   ├── useDashboardData.js           # TanStack Query hooks for dashboard APIs
│   ├── useOperationsData.js          # TanStack Query + infinite/virtual scroll
│   └── useThresholds.js              # Read thresholds from config/context
│
├── services/
│   ├── api.js                        # Axios/fetch base instance + interceptors
│   ├── signalrService.js             # SignalR hub connection singleton
│   ├── dashboardApi.js               # API calls: GET /api/dashboard/*
│   ├── operationsApi.js              # API calls: GET /api/operations/logs
│   └── settingsApi.js                # API calls: GET/PUT /api/settings
│
├── store/
│   └── filterStore.js                # Global filter state (Zustand or React Context)
│                                     #   - dateRange, insurance, practice, DNIS, callType
│                                     #   - persists across page navigation
│
├── utils/
│   ├── formatters.js                 # formatDuration(), formatPercent(), formatNumber()
│   ├── thresholds.js                 # getColor(value, thresholds) → 'green'|'yellow'|'red'
│   ├── csvExport.js                  # Export table data to CSV
│   └── dateUtils.js                  # Date range presets, date math helpers
│
└── mock/
    ├── mockDashboardData.js          # Realistic fake data for all 17 metrics
    ├── mockOperationsData.js         # 100k row generator for table testing
    └── mockSignalR.js                # Simulated SignalR push events
```

---

## 2. THE 17 CORE STRATEGIC METRICS

Exactly as defined in the original proposal — no additions, no removals.

### I. Critical Telephony & Success KPI Suite (M1–M7)

| #   | Metric                           | Chart Type(s)              | Thresholds                          |
| --- | -------------------------------- | -------------------------- | ----------------------------------- |
| 1   | Total Calls Initiated            | KPI Card + Line Chart      | —                                   |
| 2   | Successful Connection Rate       | Gauge + Line Chart         | Green >95%, Yellow 90–95%, Red <90% |
| 3   | Call Drop Rate                   | Gauge + Bar (by insurance) | Red if >10% per insurance           |
| 4   | Peak Calling Hours               | Heatmap (weekday × hour)   | Color intensity = volume            |
| 5   | Active Calls (Real-Time)         | Stacked Bar (30s refresh)  | Red if >90% capacity                |
| 6   | Call Duration Analysis (P90/P95) | Box Plot + Line Chart      | Outliers visually marked            |
| 7   | Top Dropped Insurances           | Horizontal Bar (top 5)     | Red if drop >10%                    |

### II. IVR Workflow & Automation ROI (M8–M12)

| #   | Metric                           | Chart Type(s)          | Thresholds                      |
| --- | -------------------------------- | ---------------------- | ------------------------------- |
| 8   | Initiation Source (Bot vs Human) | Donut Chart            | —                               |
| 9   | Claim Status Completion Rate     | Gauge + Line Chart     | Red if <80%                     |
| 10  | Reattempt Outcome Funnel         | Funnel (Attempt 1→2→3) | Red if no improvement after 2nd |
| 11  | First Attempt Success Rate       | KPI + Line Chart       | Red if <85%                     |
| 12  | Top Incomplete Steps             | Bar Chart (sorted)     | Identifies IVR drop-off points  |

### III. System Health & Infrastructure (M13–M17)

| #   | Metric                     | Chart Type(s)           | Thresholds                     |
| --- | -------------------------- | ----------------------- | ------------------------------ |
| 13  | Transcription Queue Length | KPI + Line (24h)        | Red alert if >100              |
| 14  | Avg Transcription Latency  | Box Plot (P90 marker)   | Red if P90 >4s                 |
| 15  | Transcription API Usage    | Stacked Bar (by vendor) | —                              |
| 16  | Concurrent Peak Monitoring | Line Graph + Alerts     | Configurable peak threshold    |
| 17  | Global System Error Rate   | KPI + Bar Chart         | Centralized QA troubleshooting |

---

## 3. PHASED IMPLEMENTATION PLAN

### PHASE 1: Foundation & Shell (Days 1–3)

> Goal: App skeleton runs, routes work, layout is pixel-ready, mock data flows.

| Task | Details                                                                                                                                                  | Est. |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1.1  | **Global CSS & Theme** — Set up Tailwind theme tokens (colors, spacing), dark-friendly palette, chart theme config                                       | 2h   |
| 1.2  | **Router Setup** — Configure React Router v7 with 3 routes: `/dashboard`, `/operations`, `/settings`                                                     | 1h   |
| 1.3  | **RootLayout + Sidebar + TopBar** — Build the app shell with collapsible sidebar and global filter bar                                                   | 4h   |
| 1.4  | **Global Filter Store** — Implement `filterStore.js` with Zustand or Context for dateRange, insurance, practice, DNIS, callType — persisted across pages | 2h   |
| 1.5  | **FilterDropdown Components** — Multi-select dropdowns for each filter dimension, wired to store                                                         | 3h   |
| 1.6  | **Mock Data Layer** — Create `mockDashboardData.js` with realistic random data for all 17 metrics and `mockOperationsData.js` (100k row generator)       | 4h   |
| 1.7  | **API Service Scaffold** — Build `api.js` base instance, `dashboardApi.js` and `operationsApi.js` with mock-backed implementations                       | 2h   |
| 1.8  | **TanStack Query Provider** — Wire up QueryClientProvider in `main.jsx`, configure staleTime, gcTime                                                     | 1h   |

### PHASE 2: Reusable UI Components (Days 4–5)

> Goal: All building blocks exist and are tested in isolation.

| Task | Details                                                                                                                                                                                                                               | Est. |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 2.1  | **KpiCard** — Displays value, label, trend arrow (+/-), optional sparkline                                                                                                                                                            | 2h   |
| 2.2  | **GaugeChart** — Radial SVG gauge with 3-zone coloring (green/yellow/red), configurable thresholds                                                                                                                                    | 3h   |
| 2.3  | **TrendBadge** — Small colored badge showing % change                                                                                                                                                                                 | 0.5h |
| 2.4  | **ThresholdBar** — Horizontal capacity bar with color zones                                                                                                                                                                           | 1h   |
| 2.5  | **Chart Wrappers** — Create all 8 chart wrappers (LineChart, BarChart, StackedBarChart, HorizontalBarChart, BoxPlotChart, HeatmapChart, DonutChart, FunnelChart) with consistent props interface, responsive sizing, and shared theme | 6h   |
| 2.6  | **ErrorBoundary + LoadingSpinner** — Consistent loading/error UX for every data section                                                                                                                                               | 1h   |

### PHASE 3: Dashboard — Telephony Metrics M1–M7 (Days 6–8)

> Goal: Metrics 1–7 render on the Dashboard page with mock data.

| Task | Details                                                                                                                     | Est. |
| ---- | --------------------------------------------------------------------------------------------------------------------------- | ---- |
| 3.1  | **M1: Total Calls Initiated** — KPI card + line chart, filterable by date/insurance/practice/DNIS/callType                  | 2h   |
| 3.2  | **M2: Successful Connection Rate** — Gauge (3-zone) + line trend, tooltip with raw numbers                                  | 2h   |
| 3.3  | **M3: Call Drop Rate** — Gauge + bar chart per insurance, sortable, red bars >10%, click-to-drill                           | 3h   |
| 3.4  | **M4: Peak Calling Hours** — Heatmap weekday × hour, color intensity, tooltip with exact count                              | 2h   |
| 3.5  | **M5: Active Calls Real-Time** — Stacked bar, auto-refresh 30s, breakdown by insurance/DNIS/source, capacity threshold line | 3h   |
| 3.6  | **M6: Call Duration Analysis** — Box plot (Min/Max/Median/P90/P95) + line chart avg over time, outlier markers              | 3h   |
| 3.7  | **M7: Top Dropped Insurances** — Horizontal bar top 5, red if >10%, click to drill into logs                                | 2h   |
| 3.8  | **Telephony Layout** — Compose TelephonySection.jsx with responsive CSS grid, section headers                               | 2h   |

### PHASE 4: Dashboard — Workflow & Infrastructure Metrics M8–M17 (Days 9–12)

> Goal: Metrics 8–17 render on the Dashboard page.

| Task | Details                                                                                                             | Est. |
| ---- | ------------------------------------------------------------------------------------------------------------------- | ---- |
| 4.1  | **M8: Initiation Source** — Donut chart bot vs human, tooltip with count + %                                        | 1.5h |
| 4.2  | **M9: Claim Status Completion Rate** — Gauge + line trend, red if <80%, click to view incomplete                    | 2h   |
| 4.3  | **M10: Reattempt Outcome Funnel** — Funnel (Attempt 1→2→3), tooltip with success % per stage, red if no improvement | 3h   |
| 4.4  | **M11: First Attempt Success Rate** — KPI + line chart, red if <85%                                                 | 1.5h |
| 4.5  | **M12: Top Incomplete Steps** — Bar chart showing IVR tree drop-off points, sorted by count                         | 2h   |
| 4.6  | **M13: Transcription Queue Length** — KPI + 24h line chart, red alert if >100, tooltip with avg wait                | 2h   |
| 4.7  | **M14: Avg Transcription Latency** — Box plot with P90 marker, red if P90 >4s, filterable by vendor                 | 2h   |
| 4.8  | **M15: Transcription API Usage** — Stacked bar by vendor, tooltip with vendor name/% of total/avg duration          | 2h   |
| 4.9  | **M16: Concurrent Peak Monitoring** — Line graph by time of day, peak markers, configurable alert threshold         | 2h   |
| 4.10 | **M17: Global System Error Rate** — KPI + bar chart by error category, centralized QA metric                        | 2h   |
| 4.11 | **Workflow & Infra Layout** — Compose WorkflowSection.jsx + InfraSection.jsx, full Dashboard grid                   | 3h   |

### PHASE 5: Operations Data Portal (Days 13–16)

> Goal: Virtualized 100k+ row table with global filter sync and drill-down.

| Task | Details                                                                                                                                                                       | Est. |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 5.1  | **Column Definitions** — Define all columns: Call ID, Timestamp, Insurance, Practice, DNIS, Source, Status, Duration, Steps, Errors, etc. using TanStack Table column helpers | 2h   |
| 5.2  | **Virtual Table Core** — Build the virtualized table using @tanstack/react-virtual with row virtualization, sticky headers                                                    | 4h   |
| 5.3  | **Server-side Pagination + Sort** — Implement cursor-based pagination with API, sort by any column                                                                            | 3h   |
| 5.4  | **Global Filter Sync** — Wire filterStore to Operations query params so dashboard ↔ operations filters stay in sync                                                           | 2h   |
| 5.5  | **Contextual Drill-Down** — When user clicks a chart segment (e.g., specific insurance drop rate), navigate to Operations pre-filtered to those records                       | 3h   |
| 5.6  | **Column Visibility Toggle** — Toolbar button to show/hide columns                                                                                                            | 1.5h |
| 5.7  | **CSV Export** — Export currently filtered data to CSV file                                                                                                                   | 2h   |
| 5.8  | **Global Search** — Full-text search across visible columns                                                                                                                   | 2h   |
| 5.9  | **Operations UI Polish** — Toolbar layout, empty states, loading skeletons, row hover highlighting                                                                            | 2h   |

### PHASE 6: SignalR Real-Time Integration (Days 17–19)

> Goal: Dashboard updates instantly when backend pushes new data.

| Task | Details                                                                                                        | Est. |
| ---- | -------------------------------------------------------------------------------------------------------------- | ---- |
| 6.1  | **SignalR Service** — Singleton connection to hub, auto-reconnect, connection state indicator in UI            | 3h   |
| 6.2  | **useSignalR Hook** — Subscribe to events, invalidate TanStack Query cache keys on server push                 | 3h   |
| 6.3  | **Mock SignalR Simulator** — For frontend-only dev: simulates push events every N seconds to test live updates | 2h   |
| 6.4  | **Real-Time Metrics** — Wire M5 (Active Calls), M16 (Concurrent Peaks) to SignalR events                       | 3h   |
| 6.5  | **Connection Status Badge** — Show LIVE/DISCONNECTED indicator in TopBar                                       | 1h   |
| 6.6  | **Cache Invalidation Strategy** — Define which query keys get invalidated by which SignalR event types         | 2h   |

### PHASE 7: Polish, UX & Performance (Days 20–23)

> Goal: Production-ready feel.

| Task | Details                                                                                                       | Est. |
| ---- | ------------------------------------------------------------------------------------------------------------- | ---- |
| 7.1  | **Responsive Design** — Test all layouts at desktop (1920px), laptop (1366px), tablet (768px), mobile (375px) | 4h   |
| 7.2  | **Dark Mode** — (Optional) If required, add dark mode toggle using Tailwind `dark:` variants                  | 4h   |
| 7.3  | **Loading States** — Skeleton screens for every chart/KPI during initial load and filter changes              | 3h   |
| 7.4  | **Animation** — Smooth transitions on filter change, number count-up on KPI cards, chart enter animations     | 3h   |
| 7.5  | **Accessibility** — ARIA labels on charts, keyboard navigation on table, focus management                     | 2h   |
| 7.6  | **Performance Audit** — React DevTools profiler, bundle size analysis, lazy-load heavy chart pages            | 3h   |
| 7.7  | **Error Handling** — Global error boundary, per-section error boundaries, retry mechanisms                    | 2h   |
| 7.8  | **Settings Page** — Threshold configuration UI (connection rate %, drop rate %, capacity limits, etc.)        | 3h   |

### PHASE 8: Backend Integration & Deployment (Days 24–28)

> Goal: Connect to real C#/IIS API, deploy.

| Task | Details                                                                                             | Est. |
| ---- | --------------------------------------------------------------------------------------------------- | ---- |
| 8.1  | **API Contract Finalization** — Document every endpoint request/response schema with Zod validation | 3h   |
| 8.2  | **Swap Mock → Real API** — Replace mock service layer with real endpoints, handle auth tokens       | 3h   |
| 8.3  | **SignalR Hub Connection** — Point to real SignalR hub URL, test with real push events              | 2h   |
| 8.4  | **Environment Config** — .env files for dev/staging/prod API URLs                                   | 1h   |
| 8.5  | **Build Optimization** — Code splitting, tree shaking, analyze bundle with `vite-plugin-visualizer` | 2h   |
| 8.6  | **IIS Deployment** — `vite build` → deploy to IIS static site, configure SPA fallback routing       | 2h   |
| 8.7  | **Smoke Testing** — Full end-to-end walkthrough of all 17 metrics + operations table with real data | 3h   |
| 8.8  | **Bug Fixes & Buffer** — Reserved time for integration issues                                       | 4h   |

---

## 4. ARCHITECTURE DECISIONS

### 4.1 State Management Strategy

```
┌─────────────────────────────────────────────────┐
│                  filterStore (Zustand)            │
│  dateRange | insurance | practice | DNIS | type  │
└──────────────┬──────────────────────┬────────────┘
               │                      │
    ┌──────────▼──────────┐  ┌───────▼────────────┐
    │  Dashboard Queries  │  │  Operations Query   │
    │  (TanStack Query)   │  │  (TanStack Query)   │
    │  - 17 query keys    │  │  - paginated logs    │
    │  - 60s staleTime    │  │  - cursor pagination │
    └──────────┬──────────┘  └───────┬────────────┘
               │                      │
    ┌──────────▼──────────┐  ┌───────▼────────────┐
    │  SignalR Events      │  │  Virtual Table      │
    │  → invalidateQueries │  │  100k+ rows         │
    └─────────────────────┘  └────────────────────┘
```

### 4.2 Query Key Convention

```js
// Dashboard metrics — one key per metric (17 total)
["dashboard", "totalCalls", { dateRange, insurance, practice }][
  ("dashboard", "connectionRate", { dateRange, insurance, practice })
][("dashboard", "dropRate", { dateRange, insurance })][
  ("dashboard", "peakHours", { dateRange, practice, callType })
][("dashboard", "activeCalls", {})][ // real-time, no filters
  ("dashboard", "callDuration", { dateRange, callType, insurance })
][("dashboard", "topDropped", { dateRange })][
  ("dashboard", "initiationSource", { dateRange, practice, callType })
][("dashboard", "claimCompletion", { dateRange })][
  ("dashboard", "reattemptFunnel", { dateRange })
][("dashboard", "firstAttemptRate", { dateRange, insurance })][
  ("dashboard", "incompleteSteps", { dateRange })
][("dashboard", "transcriptionQueue", {})][ // real-time
  ("dashboard", "transcriptionTime", { dateRange, vendor })
][("dashboard", "apiUsage", { dateRange })][
  ("dashboard", "concurrentPeaks", { dateRange })
][("dashboard", "errorRate", { dateRange })][
  // Operations logs
  ("operations", "logs", { page, sort, ...filters })
];
```

### 4.3 SignalR → Cache Invalidation Map

```js
SignalR Event              →  Invalidated Query Keys
──────────────────────────────────────────────────
'call:new'                 →  ['dashboard', 'totalCalls'], ['dashboard', 'activeCalls']
'call:completed'           →  ['dashboard', 'connectionRate'], ['dashboard', 'callDuration']
'call:dropped'             →  ['dashboard', 'dropRate'], ['dashboard', 'topDropped']
'transcription:queued'     →  ['dashboard', 'transcriptionQueue']
'transcription:completed'  →  ['dashboard', 'transcriptionTime'], ['dashboard', 'apiUsage']
'system:capacityUpdate'    →  ['dashboard', 'concurrentPeaks'], ['dashboard', 'activeCalls']
'system:error'             →  ['dashboard', 'errorRate']
```

### 4.4 Drill-Down Navigation Pattern

When a user clicks a chart segment (e.g., "Aetna" bar in Drop Rate chart):

```
1. onClick handler captures { insurance: 'Aetna', status: 'dropped' }
2. Updates filterStore with these values
3. Navigates to /operations via react-router
4. Operations page reads filterStore → constructs API query
5. Table renders pre-filtered to Aetna dropped calls
```

### 4.5 Chart Wrapper Standard Props

Every chart wrapper in `components/charts/` follows this interface:

```jsx
<LineChart
  data={[]} // Required: Nivo-formatted data
  xKey="date" // X-axis accessor
  yKey="value" // Y-axis accessor
  height={300} // Container height
  colors={["#3b82f6"]} // Color palette
  enableTooltip={true} // Show on hover
  thresholds={[
    // Optional horizontal reference lines
    { value: 95, color: "green", label: "Target" },
  ]}
  loading={false} // Shows skeleton
  onPointClick={(point) => {}} // Drill-down handler
/>
```

---

## 5. DASHBOARD LAYOUT GRID

```
┌─────────────────────────────────────────────────────────────┐
│ SIDEBAR │                    TOP BAR (Filters)              │
│         │ [Date Range ▾] [Insurance ▾] [Practice ▾] [DNIS] │
│ Dashboard│────────────────────────────────────────────────────│
│ Operations│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│ Settings │  │ M1   │ │ M2   │ │ M3   │ │ M11  │  ← KPI Row │
│          │  │Total │ │Conn% │ │Drop% │ │1stAtt│                │
│          │  └──────┘ └──────┘ └──────┘ └──────┘                │
│          │──────────────────────────────────────────────────────── │
│          │  ┌────────────────┐  ┌────────────────┐              │
│          │  │ M4: Peak Hours │  │ M6: Call Dur.  │  ← Row 2    │
│          │  │   (Heatmap)    │  │  (Box Plot)    │              │
│          │  └────────────────┘  └────────────────┘              │
│          │──────────────────────────────────────────────────────── │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│          │  │M10:Funnel│ │M5:Active │ │M7:TopDrop│  ← Row 3   │
│          │  │          │ │  Calls   │ │          │             │
│          │  └──────────┘ └──────────┘ └──────────┘             │
│          │──────────────────────────────────────────────────────── │
│          │                                                       │
│          │  ── II. IVR WORKFLOW & AUTOMATION ROI ──              │
│          │                                                       │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│          │  │M8: Bot/  │ │M9:Claim  │ │M12:Incom │  ← Row 4   │
│          │  │  Human   │ │ Status   │ │  Steps   │             │
│          │  └──────────┘ └──────────┘ └──────────┘             │
│          │──────────────────────────────────────────────────────── │
│          │                                                       │
│          │  ── III. SYSTEM HEALTH & INFRASTRUCTURE ──            │
│          │                                                       │
│          │  ┌──────┐ ┌──────┐ ┌──────────┐ ┌──────────┐        │
│          │  │M13   │ │M17   │ │M15:API   │ │M14:Trans │ ← Row 5│
│          │  │Queue │ │Error │ │  Usage   │ │ Latency  │        │
│          │  └──────┘ └──────┘ └──────────┘ └──────────┘        │
│          │  ┌────────────────────────────┐                      │
│          │  │ M16: Concurrent Peak Load  │  ← Row 6            │
│          │  │      (Full-width Line)     │                      │
│          │  └────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. MOCK DATA STRATEGY

Since the real C# API won't be ready immediately, all development uses a mock layer:

```js
// services/api.js
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true"; // default true

export async function fetchTotalCalls(filters) {
  if (USE_MOCK) return mockDashboardData.totalCalls(filters);
  return fetch(`/api/dashboard/total-calls?${toParams(filters)}`).then((r) =>
    r.json(),
  );
}
```

**Mock data generator features:**

- Realistic IVR call patterns (higher volume 9am–5pm, lower weekends)
- 15+ insurance names, 8 practice units, 10 DNIS numbers
- P90/P95 distributions using normal + skewed distributions
- 100k row operations table with all columns populated
- Simulated SignalR events via `setInterval`

---

## 7. TIMELINE SUMMARY

| Phase | Days | Dates (approx.) | Deliverable |
|-----------------------------|--------|---------------------|--------------------------------------------||
| 1: Foundation | 3 | Feb 25 – Feb 27 | App shell, routing, filters, mock data |
| 2: UI Components | 2 | Feb 28 – Mar 1 | All reusable cards, gauges, chart wrappers |
| 3: Telephony Metrics (1–7) | 3 | Mar 2 – Mar 4 | Metrics 1–7 on dashboard |
| 4: Workflow + Infra (8–17) | 4 | Mar 5 – Mar 8 | Metrics 8–17 on dashboard |
| 5: Operations Portal | 4 | Mar 9 – Mar 12 | Virtualized table, drill-down, export |
| 6: SignalR | 3 | Mar 13 – Mar 15 | Real-time push, cache invalidation |
| 7: Polish | 4 | Mar 16 – Mar 19 | Responsive, animations, a11y, perf |
| 8: Integration | 5 | Mar 20 – Mar 24 | Real API, deploy to IIS |
| Buffer | 7 | Mar 25 – Mar 31 | Bug fixes, QA, stakeholder feedback |
| **TOTAL** | **35** | **Feb 25 – Mar 31** | **Full portal deployed** |

---

## 8. API ENDPOINTS (Expected from C#/IIS Backend)

```
── Dashboard Metrics (17 endpoints) ──
GET  /api/dashboard/total-calls?from=&to=&insurance=&practice=&dnis=&callType=
GET  /api/dashboard/connection-rate?from=&to=&insurance=&practice=
GET  /api/dashboard/drop-rate?from=&to=&insurance=
GET  /api/dashboard/peak-hours?from=&to=&practice=&callType=
GET  /api/dashboard/active-calls                              (real-time)
GET  /api/dashboard/call-duration?from=&to=&callType=&insurance=
GET  /api/dashboard/top-dropped?from=&to=
GET  /api/dashboard/initiation-source?from=&to=&practice=&callType=
GET  /api/dashboard/claim-completion?from=&to=
GET  /api/dashboard/reattempt-funnel?from=&to=
GET  /api/dashboard/first-attempt-rate?from=&to=&insurance=
GET  /api/dashboard/incomplete-steps?from=&to=
GET  /api/dashboard/transcription-queue                       (real-time)
GET  /api/dashboard/transcription-time?from=&to=&vendor=
GET  /api/dashboard/transcription-api-usage?from=&to=
GET  /api/dashboard/concurrent-peaks?from=&to=
GET  /api/dashboard/error-rate?from=&to=

GET  /api/operations/logs?page=&size=&sort=&dir=&search=&...filters
GET  /api/operations/logs/export?format=csv&...filters

GET  /api/settings/thresholds
PUT  /api/settings/thresholds

SignalR Hub: /hubs/ivr-analytics
  Events: call:new, call:completed, call:dropped,
          transcription:queued, transcription:completed,
          system:capacityUpdate, system:error
```

---

## 9. IMMEDIATE NEXT STEPS

**Start Phase 1 now:**

1. Set up folder structure
2. Configure routes (React Router v7)
3. Build RootLayout (Sidebar + TopBar)
4. Create filterStore (Zustand/Context)
5. Build mock data generators for 17 metrics
6. Wire TanStack Query provider

Ready to begin implementation on your command.
