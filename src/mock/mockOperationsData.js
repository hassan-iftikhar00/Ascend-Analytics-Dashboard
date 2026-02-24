/**
 * Mock Operations Data Generator
 * Generates 100k+ realistic call log records for virtual table testing
 */
import { format, addMinutes } from "date-fns";
import {
  INSURANCES,
  PRACTICES,
  DNIS_LIST,
  CALL_TYPES,
  INITIATION_SOURCES,
  IVR_STEPS,
} from "../config/constants";

function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

const STATUSES = [
  "Completed",
  "Dropped",
  "In Progress",
  "Failed",
  "Transferred",
];
const STATUS_WEIGHTS = [0.6, 0.08, 0.05, 0.07, 0.2]; // weighted distribution

function weightedPick(items, weights) {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i];
    if (r <= cumulative) return items[i];
  }
  return items[items.length - 1];
}

/**
 * Generate a single call log record
 */
function generateRecord(id, baseDate) {
  const timestamp = addMinutes(baseDate, -randInt(0, 43200)); // up to 30 days ago
  const status = weightedPick(STATUSES, STATUS_WEIGHTS);
  const duration =
    status === "Dropped"
      ? randInt(5, 45)
      : status === "Failed"
        ? randInt(3, 30)
        : randInt(30, 720);
  const lastStep =
    status === "Completed" ? "Call Completion" : pick(IVR_STEPS.slice(0, -1));
  const attempts = status === "Completed" ? randInt(1, 3) : randInt(1, 2);
  const errors =
    status === "Failed"
      ? randInt(1, 5)
      : status === "Dropped"
        ? randInt(0, 2)
        : 0;

  return {
    id: `CALL-${String(id).padStart(7, "0")}`,
    timestamp: timestamp.toISOString(),
    timestampFormatted: format(timestamp, "yyyy-MM-dd HH:mm:ss"),
    insurance: pick(INSURANCES),
    practice: pick(PRACTICES),
    dnis: pick(DNIS_LIST),
    callType: pick(CALL_TYPES),
    source: pick(INITIATION_SOURCES),
    status,
    duration,
    durationFormatted: `${Math.floor(duration / 60)}m ${duration % 60}s`,
    lastStep,
    attempts,
    errors,
    claimId: status === "Completed" ? `CLM-${randInt(100000, 999999)}` : null,
    transcriptionTime:
      duration > 60 ? parseFloat(rand(1.5, 6).toFixed(2)) : null,
  };
}

/**
 * Generate N call log records
 * @param {number} count - Number of records (default 100000)
 * @returns {Array<Object>}
 */
let _cachedRecords = null;
let _cachedCount = 0;

export function generateOperationsData(count = 100000) {
  if (_cachedRecords && _cachedCount === count) return _cachedRecords;

  const baseDate = new Date();
  const records = [];
  for (let i = 1; i <= count; i++) {
    records.push(generateRecord(i, baseDate));
  }

  _cachedRecords = records;
  _cachedCount = count;
  return records;
}

/**
 * Get a paginated slice with sorting and filtering
 */
export function getOperationsPage({
  page = 1,
  pageSize = 50,
  sort,
  dir,
  filters,
  search,
}) {
  let data = generateOperationsData();

  // Apply filters
  if (filters) {
    if (filters.insurance?.length)
      data = data.filter((r) => filters.insurance.includes(r.insurance));
    if (filters.practice?.length)
      data = data.filter((r) => filters.practice.includes(r.practice));
    if (filters.dnis?.length)
      data = data.filter((r) => filters.dnis.includes(r.dnis));
    if (filters.callType?.length)
      data = data.filter((r) => filters.callType.includes(r.callType));
    if (filters.status) data = data.filter((r) => r.status === filters.status);
  }

  // Apply search
  if (search) {
    const q = search.toLowerCase();
    data = data.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.insurance.toLowerCase().includes(q) ||
        r.practice.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        r.lastStep.toLowerCase().includes(q),
    );
  }

  // Apply sort
  if (sort) {
    const direction = dir === "desc" ? -1 : 1;
    data.sort((a, b) => {
      const aVal = a[sort];
      const bVal = b[sort];
      if (typeof aVal === "number") return (aVal - bVal) * direction;
      return String(aVal).localeCompare(String(bVal)) * direction;
    });
  }

  const totalRecords = data.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const start = (page - 1) * pageSize;
  const pageData = data.slice(start, start + pageSize);

  return {
    data: pageData,
    page,
    pageSize,
    totalRecords,
    totalPages,
  };
}
