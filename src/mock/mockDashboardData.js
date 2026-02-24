/**
 * Mock Dashboard Data Generator
 * Generates realistic IVR call center data for all 17 metrics
 */
import { format, subDays, eachDayOfInterval } from "date-fns";
import {
  INSURANCES,
  PRACTICES,
  DNIS_LIST,
  CALL_TYPES,
  INITIATION_SOURCES,
  TRANSCRIPTION_VENDORS,
  IVR_STEPS,
} from "../config/constants";

// ── Helpers ──
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}
// pick() not needed in dashboard mock but kept for reference
// function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
function gaussianRand() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// ── Time-weighted volume (higher 9am-5pm, lower nights/weekends) ──
function getHourWeight(hour) {
  if (hour >= 9 && hour <= 17) return 1.0;
  if (hour >= 7 && hour <= 9) return 0.6;
  if (hour >= 17 && hour <= 20) return 0.5;
  return 0.15;
}

function getDayWeight(dayOfWeek) {
  // 0=Sun, 6=Sat
  if (dayOfWeek === 0) return 0.3;
  if (dayOfWeek === 6) return 0.4;
  return 1.0;
}

// ══════════════════════════════════════════════
// M1: Total Calls Initiated
// ══════════════════════════════════════════════
export function generateTotalCalls(filters) {
  const days = getDayRange(filters);
  const baseVolume = 24812;

  const trendData = days.map((day) => {
    const d = new Date(day);
    const weight = getDayWeight(d.getDay());
    const dailyVariance = rand(0.85, 1.15);
    const count = Math.round(baseVolume * weight * dailyVariance);
    return { date: format(d, "MMM dd"), value: count };
  });

  const total = trendData.reduce((sum, d) => sum + d.value, 0);
  const avgDaily = Math.round(total / trendData.length);

  return {
    total,
    avgDaily,
    trend: rand(-3, 5).toFixed(1),
    trendData,
  };
}

// ══════════════════════════════════════════════
// M2: Successful Connection Rate
// ══════════════════════════════════════════════
export function generateConnectionRate(filters) {
  const days = getDayRange(filters);
  const baseRate = 98.2;

  const trendData = days.map((day) => {
    const variance = gaussianRand() * 1.2;
    const rate = clamp(baseRate + variance, 88, 99.9);
    return {
      date: format(new Date(day), "MMM dd"),
      value: parseFloat(rate.toFixed(1)),
    };
  });

  const current = trendData[trendData.length - 1]?.value || baseRate;
  const previous = trendData[trendData.length - 2]?.value || baseRate;

  return {
    current,
    trend: parseFloat((current - previous).toFixed(1)),
    connected: Math.round((24812 * current) / 100),
    initiated: 24812,
    trendData,
  };
}

// ══════════════════════════════════════════════
// M3: Call Drop Rate
// ══════════════════════════════════════════════
export function generateDropRate() {
  const overallRate = parseFloat(rand(1.0, 3.5).toFixed(2));

  const byInsurance = INSURANCES.slice(0, 10)
    .map((name) => ({
      insurance: name,
      dropRate: parseFloat(rand(0.5, 15).toFixed(1)),
      totalCalls: randInt(800, 4000),
    }))
    .sort((a, b) => b.dropRate - a.dropRate);

  return {
    overall: overallRate,
    trend: parseFloat(rand(-3, 1).toFixed(1)),
    byInsurance,
  };
}

// ══════════════════════════════════════════════
// M4: Peak Calling Hours (Heatmap)
// ══════════════════════════════════════════════
export function generatePeakHours() {
  const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7am to 8pm

  const data = weekdays.map((day) => ({
    id: day,
    data: hours.map((hour) => {
      const dayIdx = weekdays.indexOf(day);
      const dayW = dayIdx >= 5 ? 0.35 : 1.0;
      const hourW = getHourWeight(hour);
      const volume = Math.round(rand(50, 400) * dayW * hourW);
      return { x: `${hour}:00`, y: volume };
    }),
  }));

  return data;
}

// ══════════════════════════════════════════════
// M5: Active Calls Real-Time
// ══════════════════════════════════════════════
export function generateActiveCalls() {
  const capacityMax = 900;
  const segments = ["Aetna", "Blue Cross", "Cigna", "UnitedHealth", "Other"];
  const total = randInt(600, 880);

  const breakdown = segments.map((name) => {
    return { segment: name, value: 0 };
  });

  let remaining = total;
  for (let i = 0; i < breakdown.length - 1; i++) {
    const val = Math.round(total * rand(0.12, 0.28));
    breakdown[i].value = Math.min(val, remaining);
    remaining -= breakdown[i].value;
  }
  breakdown[breakdown.length - 1].value = remaining;

  return {
    total,
    capacity: capacityMax,
    utilizationPercent: parseFloat(((total / capacityMax) * 100).toFixed(1)),
    breakdown,
    timestamp: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════
// M6: Call Duration Analysis (P90/P95)
// ══════════════════════════════════════════════
export function generateCallDuration(filters) {
  const days = getDayRange(filters);

  // Box plot data
  const min = randInt(15, 30);
  const p25 = randInt(90, 150);
  const median = randInt(200, 280);
  const p75 = randInt(300, 400);
  const p90 = randInt(420, 520);
  const p95 = randInt(530, 600);
  const max = randInt(700, 900);

  // Trend line (avg over time)
  const trendData = days.map((day) => ({
    date: format(new Date(day), "MMM dd"),
    value: randInt(230, 310),
  }));

  return {
    boxPlot: { min, p25, median, p75, p90, p95, max },
    meanDuration: 264, // 4m 24s
    p99Outlier: 760, // 12m 40s
    trendData,
  };
}

// ══════════════════════════════════════════════
// M7: Top Dropped Insurances
// ══════════════════════════════════════════════
export function generateTopDropped() {
  return INSURANCES.slice(0, 7)
    .map((name) => ({
      insurance: name,
      dropRate: parseFloat(rand(2, 18).toFixed(1)),
      droppedCalls: randInt(20, 350),
      totalCalls: randInt(1500, 5000),
    }))
    .sort((a, b) => b.dropRate - a.dropRate)
    .slice(0, 5);
}

// ══════════════════════════════════════════════
// M8: Initiation Source (Bot vs Human)
// ══════════════════════════════════════════════
export function generateInitiationSource() {
  const botPercent = rand(55, 75);
  const humanPercent = 100 - botPercent;
  const total = randInt(20000, 28000);

  return {
    data: [
      {
        id: "Bot",
        label: "Bot",
        value: Math.round((total * botPercent) / 100),
        percent: parseFloat(botPercent.toFixed(1)),
      },
      {
        id: "Human",
        label: "Human",
        value: Math.round((total * humanPercent) / 100),
        percent: parseFloat(humanPercent.toFixed(1)),
      },
    ],
    total,
  };
}

// ══════════════════════════════════════════════
// M9: Claim Status Completion Rate
// ══════════════════════════════════════════════
export function generateClaimCompletion(filters) {
  const days = getDayRange(filters);
  const baseRate = rand(78, 94);

  const trendData = days.map((day) => ({
    date: format(new Date(day), "MMM dd"),
    value: parseFloat(clamp(baseRate + gaussianRand() * 3, 65, 99).toFixed(1)),
  }));

  const current = trendData[trendData.length - 1]?.value || baseRate;

  return {
    current: parseFloat(current.toFixed(1)),
    trend: parseFloat(rand(-2, 3).toFixed(1)),
    completedCalls: randInt(15000, 22000),
    totalAttempted: randInt(22000, 26000),
    trendData,
  };
}

// ══════════════════════════════════════════════
// M10: Reattempt Outcome Funnel
// ══════════════════════════════════════════════
export function generateReattemptFunnel() {
  const initial = randInt(22000, 26000);
  const attempt1Success = rand(0.58, 0.68);
  const attempt2Success = rand(0.35, 0.5);
  const attempt1Failed = Math.round(initial * (1 - attempt1Success));
  const attempt2 = attempt1Failed;
  const attempt2Failed = Math.round(attempt2 * (1 - attempt2Success));
  const attempt3 = attempt2Failed;

  return {
    stages: [
      {
        label: "Initial Attempt",
        count: initial,
        percent: 100,
        dropoutPercent: null,
      },
      {
        label: "2nd Attempt",
        count: attempt2,
        percent: parseFloat(((attempt2 / initial) * 100).toFixed(0)),
        dropoutPercent: parseFloat(((1 - attempt1Success) * 100).toFixed(0)),
      },
      {
        label: "3rd Attempt",
        count: attempt3,
        percent: parseFloat(((attempt3 / initial) * 100).toFixed(0)),
        dropoutPercent: parseFloat(((1 - attempt2Success) * 100).toFixed(0)),
      },
    ],
  };
}

// ══════════════════════════════════════════════
// M11: First Attempt Success Rate
// ══════════════════════════════════════════════
export function generateFirstAttemptRate(filters) {
  const days = getDayRange(filters);
  const baseRate = rand(82, 92);

  const trendData = days.map((day) => ({
    date: format(new Date(day), "MMM dd"),
    value: parseFloat(clamp(baseRate + gaussianRand() * 2, 70, 98).toFixed(1)),
  }));

  const current = trendData[trendData.length - 1]?.value || baseRate;

  return {
    current: parseFloat(current.toFixed(1)),
    trend: parseFloat(rand(-2, 3).toFixed(1)),
    trendData,
  };
}

// ══════════════════════════════════════════════
// M12: Top Incomplete Steps
// ══════════════════════════════════════════════
export function generateIncompleteSteps() {
  return IVR_STEPS.map((step) => ({
    step,
    incompleteCount: randInt(50, 800),
    totalAttempts: randInt(5000, 25000),
  }))
    .map((item) => ({
      ...item,
      incompletePercent: parseFloat(
        ((item.incompleteCount / item.totalAttempts) * 100).toFixed(1),
      ),
    }))
    .sort((a, b) => b.incompleteCount - a.incompleteCount);
}

// ══════════════════════════════════════════════
// M13: Transcription Queue Length
// ══════════════════════════════════════════════
export function generateTranscriptionQueue() {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const currentLength = randInt(20, 130);

  const trendData = hours.map((h) => ({
    hour: `${String(h).padStart(2, "0")}:00`,
    value: randInt(10, 150),
  }));

  return {
    current: currentLength,
    avgWaitTime: parseFloat(rand(1.5, 8).toFixed(1)),
    trend: parseFloat(rand(-20, 15).toFixed(0)),
    trendData,
  };
}

// ══════════════════════════════════════════════
// M14: Avg Transcription Latency (Box Plot)
// ══════════════════════════════════════════════
export function generateTranscriptionLatency() {
  const vendors = TRANSCRIPTION_VENDORS.map((vendor) => ({
    vendor,
    min: parseFloat(rand(0.3, 0.8).toFixed(2)),
    p25: parseFloat(rand(1.0, 1.8).toFixed(2)),
    median: parseFloat(rand(2.0, 2.8).toFixed(2)),
    p75: parseFloat(rand(3.0, 3.5).toFixed(2)),
    p90: parseFloat(rand(3.5, 5.0).toFixed(2)),
    max: parseFloat(rand(5.0, 8.0).toFixed(2)),
  }));

  const overallP90 = parseFloat(
    (vendors.reduce((s, v) => s + v.p90, 0) / vendors.length).toFixed(2),
  );

  return { vendors, overallP90 };
}

// ══════════════════════════════════════════════
// M15: Transcription API Usage
// ══════════════════════════════════════════════
export function generateApiUsage(filters) {
  const days = getDayRange(filters);

  const data = days.map((day) => {
    const entry = { date: format(new Date(day), "MMM dd") };
    TRANSCRIPTION_VENDORS.forEach((vendor) => {
      entry[vendor] = randInt(200, 2000);
    });
    return entry;
  });

  const totalByVendor = TRANSCRIPTION_VENDORS.map((vendor) => ({
    vendor,
    total: data.reduce((s, d) => s + (d[vendor] || 0), 0),
  }));

  return { data, totalByVendor, vendors: TRANSCRIPTION_VENDORS };
}

// ══════════════════════════════════════════════
// M16: Concurrent Peak Monitoring
// ══════════════════════════════════════════════
export function generateConcurrentPeaks() {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const peakThreshold = 900;

  const data = hours.map((h) => {
    const weight = getHourWeight(h);
    const concurrent = Math.round(rand(100, 900) * weight);
    return {
      hour: `${String(h).padStart(2, "0")}:00`,
      value: concurrent,
      isPeak: concurrent > peakThreshold * 0.85,
    };
  });

  const peakValue = Math.max(...data.map((d) => d.value));
  const peakHour = data.find((d) => d.value === peakValue)?.hour;

  return {
    data,
    peakValue,
    peakHour,
    threshold: peakThreshold,
  };
}

// ══════════════════════════════════════════════
// M17: Global System Error Rate
// ══════════════════════════════════════════════
export function generateErrorRate(filters) {
  const days = getDayRange(filters);
  const baseRate = rand(1.5, 4.5);

  const trendData = days.map((day) => ({
    date: format(new Date(day), "MMM dd"),
    value: parseFloat(
      clamp(baseRate + gaussianRand() * 1.5, 0.5, 12).toFixed(1),
    ),
  }));

  const byCategory = [
    { category: "Timeout", count: randInt(50, 300), percent: 0 },
    { category: "API Failure", count: randInt(30, 200), percent: 0 },
    { category: "Auth Error", count: randInt(10, 80), percent: 0 },
    { category: "Network", count: randInt(20, 150), percent: 0 },
    { category: "Unknown", count: randInt(5, 50), percent: 0 },
  ];
  const totalErrors = byCategory.reduce((s, c) => s + c.count, 0);
  byCategory.forEach((c) => {
    c.percent = parseFloat(((c.count / totalErrors) * 100).toFixed(1));
  });

  return {
    current: parseFloat(
      trendData[trendData.length - 1]?.value.toFixed(1) || baseRate.toFixed(1),
    ),
    trend: parseFloat(rand(-2, 2).toFixed(1)),
    totalErrors,
    byCategory,
    trendData,
  };
}

// ══════════════════════════════════════════════
// Helper: Generate day range from filters
// ══════════════════════════════════════════════
function getDayRange(filters) {
  const to = filters?.dateRange?.to || new Date();
  const from = filters?.dateRange?.from || subDays(to, 7);
  return eachDayOfInterval({ start: from, end: to });
}
