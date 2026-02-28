/**
 * Dashboard API Routes - All 17 Metrics
 *
 * Real SQL queries against IVR2 database.
 *
 * Core Tables:
 *   outboundmaster (om)        - Call batch sessions
 *   outboundmaster_detail (od) - Individual claim calls  (od.OID = om.ID)
 *   outboundCallStatus (ocs)   - Status reference
 *   application (app)          - AppID -> Insurance name
 *   cdrmaster (cdr)            - Inbound CDRs with Duration
 */
import { Router } from "express";
import { query, rawQuery, sql } from "../db.js";

const router = Router();

// -- Helper: parse filter params from query string --
function parseFilters(req) {
  return {
    from: req.query.from || null,
    to: req.query.to || null,
    insurance: req.query.insurance ? req.query.insurance.split(",") : [],
    practice: req.query.practice ? req.query.practice.split(",") : [],
    dnis: req.query.dnis ? req.query.dnis.split(",") : [],
    callType: req.query.callType ? req.query.callType.split(",") : [],
  };
}

/**
 * Build WHERE clause for outboundmaster + outboundmaster_detail joins.
 * om = outboundmaster alias, od = outboundmaster_detail alias
 */
function buildWhereClause(filters) {
  const conditions = [];
  const params = {};

  if (filters.from) {
    conditions.push("om.CallDate >= @dateFrom");
    params.dateFrom = { type: sql.DateTime, value: new Date(filters.from) };
  }
  if (filters.to) {
    conditions.push("om.CallDate <= @dateTo");
    params.dateTo = { type: sql.DateTime, value: new Date(filters.to) };
  }
  if (filters.insurance.length > 0) {
    const orConds = filters.insurance.map(
      (_, i) => `od.UniqueIndetifier LIKE @ins${i} + N'_%'`,
    );
    conditions.push(`(${orConds.join(" OR ")})`);
    filters.insurance.forEach((v, i) => {
      params[`ins${i}`] = { type: sql.NVarChar, value: v };
    });
  }
  if (filters.practice.length > 0) {
    conditions.push(
      `od.PracticeCode IN (${filters.practice.map((_, i) => `@prac${i}`).join(",")})`,
    );
    filters.practice.forEach((v, i) => {
      params[`prac${i}`] = { type: sql.NVarChar, value: v };
    });
  }
  if (filters.dnis.length > 0) {
    conditions.push(
      `RTRIM(od.IVR_Insurance) IN (${filters.dnis.map((_, i) => `@dnis${i}`).join(",")})`,
    );
    filters.dnis.forEach((v, i) => {
      params[`dnis${i}`] = { type: sql.NVarChar, value: v };
    });
  }

  const whereSQL =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return { whereSQL, params };
}

// SQL expression: extract insurance name from UniqueIndetifier prefix
const INS_EXPR =
  "LEFT(od.UniqueIndetifier, CHARINDEX(N'_', od.UniqueIndetifier + N'_') - 1)";

// ===================================================
// M1: Total Calls Initiated
// GET /api/dashboard/total-calls
// ===================================================
router.get("/total-calls", async (req, res, next) => {
  try {
    const filters = parseFilters(req);
    const { whereSQL, params } = buildWhereClause(filters);

    const result = await query(
      `SELECT
        CAST(om.CallDate AS DATE) AS callDate,
        COUNT(od.ID) AS callCount
      FROM outboundmaster om
      INNER JOIN outboundmaster_detail od ON od.OID = om.ID
      ${whereSQL}
      GROUP BY CAST(om.CallDate AS DATE)
      ORDER BY callDate`,
      params,
    );

    const rows = result.recordset;
    const total = rows.reduce((s, r) => s + r.callCount, 0);
    const avgDaily = rows.length > 0 ? Math.round(total / rows.length) : 0;
    const trend =
      rows.length >= 2
        ? (
            ((rows[rows.length - 1].callCount -
              rows[rows.length - 2].callCount) /
              (rows[rows.length - 2].callCount || 1)) *
            100
          ).toFixed(1)
        : "0.0";

    res.json({
      total,
      avgDaily,
      trend,
      trendData: rows.map((r) => ({
        date: new Date(r.callDate).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        }),
        value: r.callCount,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// M2: Successful Connection Rate
// GET /api/dashboard/connection-rate
// S = Dialed/Connected. R = Redial/Failed to dial.
// ===================================================
router.get("/connection-rate", async (req, res, next) => {
  try {
    const filters = parseFilters(req);
    const { whereSQL, params } = buildWhereClause(filters);

    const result = await query(
      `SELECT
        CAST(om.CallDate AS DATE) AS callDate,
        COUNT(od.ID) AS total,
        SUM(CASE WHEN RTRIM(od.Status) NOT IN ('R','D','Q') THEN 1 ELSE 0 END) AS connected
      FROM outboundmaster om
      INNER JOIN outboundmaster_detail od ON od.OID = om.ID
      ${whereSQL}
      GROUP BY CAST(om.CallDate AS DATE)
      ORDER BY callDate`,
      params,
    );

    const rows = result.recordset;
    const totalAll = rows.reduce((s, r) => s + r.total, 0);
    const totalConnected = rows.reduce((s, r) => s + r.connected, 0);
    const current =
      totalAll > 0
        ? parseFloat(((totalConnected / totalAll) * 100).toFixed(1))
        : 0;

    const trendData = rows.map((r) => ({
      date: new Date(r.callDate).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      }),
      value:
        r.total > 0
          ? parseFloat(((r.connected / r.total) * 100).toFixed(1))
          : 0,
    }));

    const latest = trendData[trendData.length - 1]?.value || 0;
    const prev = trendData[trendData.length - 2]?.value || 0;

    res.json({
      current,
      trend: parseFloat((latest - prev).toFixed(1)),
      connected: totalConnected,
      initiated: totalAll,
      trendData,
    });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// M3: Call Drop / Fail Rate
// GET /api/dashboard/drop-rate
// F = Fail (call terminated before recording output)
// ===================================================
router.get("/drop-rate", async (req, res, next) => {
  try {
    const filters = parseFilters(req);
    const { whereSQL, params } = buildWhereClause(filters);

    const result = await query(
      `SELECT
        ${INS_EXPR} AS Insurance,
        COUNT(od.ID) AS total,
        SUM(CASE WHEN RTRIM(od.Status) = 'F' THEN 1 ELSE 0 END) AS dropped
      FROM outboundmaster om
      INNER JOIN outboundmaster_detail od ON od.OID = om.ID
      ${whereSQL}
      GROUP BY ${INS_EXPR}
      ORDER BY SUM(CASE WHEN RTRIM(od.Status) = 'F' THEN 1 ELSE 0 END) DESC`,
      params,
    );

    const rows = result.recordset;
    const totalAll = rows.reduce((s, r) => s + r.total, 0);
    const totalDropped = rows.reduce((s, r) => s + r.dropped, 0);
    const overall =
      totalAll > 0
        ? parseFloat(((totalDropped / totalAll) * 100).toFixed(1))
        : 0;

    res.json({
      overall,
      trend: "0.0",
      byInsurance: rows.slice(0, 15).map((r) => ({
        insurance: r.Insurance || "Unknown",
        dropRate:
          r.total > 0
            ? parseFloat(((r.dropped / r.total) * 100).toFixed(1))
            : 0,
        total: r.total,
        dropped: r.dropped,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// M4: Peak Calling Hours
// GET /api/dashboard/peak-hours
// ===================================================
router.get("/peak-hours", async (req, res, next) => {
  try {
    const filters = parseFilters(req);
    const { whereSQL, params } = buildWhereClause(filters);

    const result = await query(
      `SELECT
        DATEPART(HOUR, om.CallInTime) AS hour,
        DATENAME(WEEKDAY, om.CallDate) AS dayOfWeek,
        COUNT(od.ID) AS callCount
      FROM outboundmaster om
      INNER JOIN outboundmaster_detail od ON od.OID = om.ID
      ${whereSQL}
      GROUP BY DATEPART(HOUR, om.CallInTime), DATENAME(WEEKDAY, om.CallDate)
      ORDER BY DATEPART(HOUR, om.CallInTime)`,
      params,
    );

    const rows = result.recordset;
    const hourlyMap = {};
    rows.forEach((r) => {
      if (!hourlyMap[r.hour]) hourlyMap[r.hour] = 0;
      hourlyMap[r.hour] += r.callCount;
    });

    const hourly = Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, "0")}:00`,
      calls: hourlyMap[i] || 0,
    }));

    const peak = hourly.reduce(
      (max, h) => (h.calls > max.calls ? h : max),
      hourly[0],
    );

    const heatmapData = rows.map((r) => ({
      x: `${String(r.hour).padStart(2, "0")}:00`,
      y: r.dayOfWeek,
      value: r.callCount,
    }));

    res.json({ hourly, peak, heatmapData });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// M5: Active / Queued Calls (Real-Time snapshot)
// GET /api/dashboard/active-calls
// ===================================================
router.get("/active-calls", async (_req, res, next) => {
  try {
    const pendingResult = await rawQuery(
      `SELECT COUNT(*) AS activeCalls
       FROM outboundmaster
       WHERE RTRIM(Status) = 'P'`,
    );

    const active = pendingResult.recordset[0]?.activeCalls || 0;

    const detailResult = await rawQuery(
      `SELECT
        RTRIM(od.Status) AS detailStatus,
        COUNT(*) AS cnt
      FROM outboundmaster om
      INNER JOIN outboundmaster_detail od ON od.OID = om.ID
      WHERE RTRIM(om.Status) = 'P'
      GROUP BY RTRIM(od.Status)`,
    );

    const capacity = 500;

    res.json({
      current: active,
      capacity,
      utilizationPct: parseFloat(((active / capacity) * 100).toFixed(1)),
      statusBreakdown: detailResult.recordset.map((r) => ({
        status: r.detailStatus,
        count: r.cnt,
      })),
      history: [],
    });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// M6: Call Duration Distribution
// GET /api/dashboard/call-duration
// Uses cdrmaster which has Duration column
// ===================================================
router.get("/call-duration", async (req, res, next) => {
  try {
    const filters = parseFilters(req);
    const dateParams = {};
    const dateConds = [];

    if (filters.from) {
      dateConds.push("cdr.CallDate >= @dateFrom");
      dateParams.dateFrom = {
        type: sql.DateTime,
        value: new Date(filters.from),
      };
    }
    if (filters.to) {
      dateConds.push("cdr.CallDate <= @dateTo");
      dateParams.dateTo = { type: sql.DateTime, value: new Date(filters.to) };
    }

    const cdrWhere =
      dateConds.length > 0 ? `WHERE ${dateConds.join(" AND ")}` : "";

    const result = await query(
      `SELECT
        COALESCE(app.Insurance, 'Unknown') AS Insurance,
        AVG(cdr.Duration) AS avgDuration,
        MIN(cdr.Duration) AS minDuration,
        MAX(cdr.Duration) AS maxDuration,
        COUNT(*) AS callCount
      FROM cdrmaster cdr
      LEFT JOIN application app ON cdr.AppID = app.AppID
      ${cdrWhere}
      GROUP BY COALESCE(app.Insurance, 'Unknown')
      HAVING COUNT(*) > 0
      ORDER BY AVG(cdr.Duration) DESC`,
      dateParams,
    );

    const rows = result.recordset;
    const totalCalls = rows.reduce((s, r) => s + r.callCount, 0);
    const allAvg =
      totalCalls > 0
        ? parseFloat(
            (
              rows.reduce((s, r) => s + r.avgDuration * r.callCount, 0) /
              totalCalls
            ).toFixed(1),
          )
        : 0;

    res.json({
      overall: { avg: allAvg },
      byInsurance: rows.map((r) => ({
        insurance: r.Insurance,
        avg: parseFloat(r.avgDuration.toFixed(1)),
        min: r.minDuration,
        max: r.maxDuration,
        count: r.callCount,
        median: null,
        p90: null,
        p95: null,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// M7: Top Dropped / Failed Insurances
// GET /api/dashboard/top-dropped
// ===================================================
router.get("/top-dropped", async (req, res, next) => {
  try {
    const filters = parseFilters(req);
    const { whereSQL, params } = buildWhereClause(filters);

    const result = await query(
      `SELECT TOP 10
        ${INS_EXPR} AS Insurance,
        COUNT(od.ID) AS total,
        SUM(CASE WHEN RTRIM(od.Status) = 'F' THEN 1 ELSE 0 END) AS dropped,
        CAST(
          SUM(CASE WHEN RTRIM(od.Status) = 'F' THEN 1.0 ELSE 0 END) / NULLIF(COUNT(*), 0) * 100
          AS DECIMAL(5,1)
        ) AS dropPct
      FROM outboundmaster om
      INNER JOIN outboundmaster_detail od ON od.OID = om.ID
      ${whereSQL}
      GROUP BY ${INS_EXPR}
      HAVING SUM(CASE WHEN RTRIM(od.Status) = 'F' THEN 1 ELSE 0 END) > 0
      ORDER BY dropped DESC`,
      params,
    );

    res.json({
      insurances: result.recordset.map((r) => ({
        insurance: r.Insurance || "Unknown",
        total: r.total,
        dropped: r.dropped,
        dropPct: parseFloat(r.dropPct || 0),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// M8: Call Status Breakdown (Initiation Source)
// GET /api/dashboard/initiation-source
// ===================================================
router.get("/initiation-source", async (req, res, next) => {
  try {
    const filters = parseFilters(req);
    const { whereSQL, params } = buildWhereClause(filters);

    const result = await query(
      `SELECT
        RTRIM(od.Status) AS statusCode,
        COALESCE(ocs.Description, 'Status: ' + RTRIM(od.Status)) AS source,
        COUNT(od.ID) AS count
      FROM outboundmaster om
      INNER JOIN outboundmaster_detail od ON od.OID = om.ID
      LEFT JOIN outboundCallStatus ocs ON RTRIM(od.Status) = RTRIM(ocs.CallStatus)
      ${whereSQL}
      GROUP BY RTRIM(od.Status), COALESCE(ocs.Description, 'Status: ' + RTRIM(od.Status))
      ORDER BY COUNT(od.ID) DESC`,
      params,
    );

    const total = result.recordset.reduce((s, r) => s + r.count, 0);

    res.json({
      sources: result.recordset.map((r) => ({
        id: r.statusCode,
        label: r.source,
        value: r.count,
        pct: total > 0 ? parseFloat(((r.count / total) * 100).toFixed(1)) : 0,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// M9: Claim Completion Rate
// GET /api/dashboard/claim-completion
// C = Completed (claim status found and transcribed)
// ===================================================
router.get("/claim-completion", async (req, res, next) => {
  try {
    const filters = parseFilters(req);
    const { whereSQL, params } = buildWhereClause(filters);

    const result = await query(
      `SELECT
        RTRIM(od.Status) AS statusCode,
        COALESCE(ocs.Description, RTRIM(od.Status)) AS ClaimStatus,
        COUNT(od.ID) AS count
      FROM outboundmaster om
      INNER JOIN outboundmaster_detail od ON od.OID = om.ID
      LEFT JOIN outboundCallStatus ocs ON RTRIM(od.Status) = RTRIM(ocs.CallStatus)
      ${whereSQL}
      GROUP BY RTRIM(od.Status), COALESCE(ocs.Description, RTRIM(od.Status))
      ORDER BY COUNT(od.ID) DESC`,
      params,
    );

    const rows = result.recordset;
    const total = rows.reduce((s, r) => s + r.count, 0);
    const completed = rows.find((r) => r.statusCode === "C");
    const completionRate =
      total > 0 && completed
        ? parseFloat(((completed.count / total) * 100).toFixed(1))
        : 0;

    res.json({
      completionRate,
      total,
      statuses: rows.map((r) => ({
        status: r.ClaimStatus,
        count: r.count,
        pct: total > 0 ? parseFloat(((r.count / total) * 100).toFixed(1)) : 0,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// M10: Reattempt Outcome Funnel
// GET /api/dashboard/reattempt-funnel
// Groups claims by how many detail records each master has
// ===================================================
router.get("/reattempt-funnel", async (req, res, next) => {
  try {
    const filters = parseFilters(req);
    const { whereSQL, params } = buildWhereClause(filters);

    const result = await query(
      `SELECT
        attempts,
        COUNT(*) AS batchCount,
        SUM(succeeded) AS totalSucceeded,
        SUM(failed) AS totalFailed
      FROM (
        SELECT
          om.ID,
          COUNT(od.ID) AS attempts,
          SUM(CASE WHEN RTRIM(od.Status) IN ('S','C') THEN 1 ELSE 0 END) AS succeeded,
          SUM(CASE WHEN RTRIM(od.Status) IN ('F','R','E','G') THEN 1 ELSE 0 END) AS failed
        FROM outboundmaster om
        INNER JOIN outboundmaster_detail od ON od.OID = om.ID
        ${whereSQL}
        GROUP BY om.ID
      ) sub
      GROUP BY attempts
      ORDER BY attempts`,
      params,
    );

    res.json({
      funnel: result.recordset.map((r) => ({
        attempt: r.attempts,
        total: r.batchCount,
        succeeded: r.totalSucceeded,
        failed: r.totalFailed,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// M11: First Attempt Success Rate
// GET /api/dashboard/first-attempt-rate
// ===================================================
router.get("/first-attempt-rate", async (req, res, next) => {
  try {
    const filters = parseFilters(req);
    const { whereSQL, params } = buildWhereClause(filters);

    const result = await query(
      `SELECT
        CAST(om.CallDate AS DATE) AS callDate,
        COUNT(DISTINCT om.ID) AS total,
        SUM(CASE WHEN firstDetail.Status IN ('S','C') THEN 1 ELSE 0 END) AS firstAttemptSuccess
      FROM outboundmaster om
      CROSS APPLY (
        SELECT TOP 1 RTRIM(od2.Status) AS Status
        FROM outboundmaster_detail od2
        WHERE od2.OID = om.ID
        ORDER BY od2.ID ASC
      ) firstDetail
      INNER JOIN outboundmaster_detail od ON od.OID = om.ID
      ${whereSQL}
      GROUP BY CAST(om.CallDate AS DATE)
      ORDER BY callDate`,
      params,
    );

    const rows = result.recordset;
    const totalAll = rows.reduce((s, r) => s + r.total, 0);
    const totalFAS = rows.reduce((s, r) => s + r.firstAttemptSuccess, 0);
    const rate =
      totalAll > 0 ? parseFloat(((totalFAS / totalAll) * 100).toFixed(1)) : 0;

    res.json({
      rate,
      total: totalAll,
      firstAttemptSuccess: totalFAS,
      trendData: rows.map((r) => ({
        date: new Date(r.callDate).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        }),
        value:
          r.total > 0
            ? parseFloat(((r.firstAttemptSuccess / r.total) * 100).toFixed(1))
            : 0,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// M12: Top Incomplete / Failed Steps
// GET /api/dashboard/incomplete-steps
// I=Incomplete, F=Fail, E=Empty, G=GoogleErr, R=Redial
// ===================================================
router.get("/incomplete-steps", async (req, res, next) => {
  try {
    const filters = parseFilters(req);
    const { whereSQL, params } = buildWhereClause(filters);

    const statusFilter = whereSQL
      ? `${whereSQL} AND RTRIM(od.Status) IN ('I','F','E','G','R')`
      : `WHERE RTRIM(od.Status) IN ('I','F','E','G','R')`;

    const result = await query(
      `SELECT
        RTRIM(od.Status) AS statusCode,
        COALESCE(ocs.Description, RTRIM(od.Status)) AS step,
        ${INS_EXPR} AS Insurance,
        COUNT(od.ID) AS count
      FROM outboundmaster om
      INNER JOIN outboundmaster_detail od ON od.OID = om.ID
      LEFT JOIN outboundCallStatus ocs ON RTRIM(od.Status) = RTRIM(ocs.CallStatus)
      ${statusFilter}
      GROUP BY RTRIM(od.Status), COALESCE(ocs.Description, RTRIM(od.Status)), ${INS_EXPR}
      ORDER BY COUNT(od.ID) DESC`,
      params,
    );

    const total = result.recordset.reduce((s, r) => s + r.count, 0);

    const stepMap = {};
    result.recordset.forEach((r) => {
      if (!stepMap[r.step]) stepMap[r.step] = { step: r.step, count: 0 };
      stepMap[r.step].count += r.count;
    });

    res.json({
      steps: Object.values(stepMap)
        .sort((a, b) => b.count - a.count)
        .map((r) => ({
          step: r.step,
          count: r.count,
          pct: total > 0 ? parseFloat(((r.count / total) * 100).toFixed(1)) : 0,
        })),
    });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// M13: Transcription Queue Length
// GET /api/dashboard/transcription-queue
// outboundmaster.Status = 'P' = pending transcription
// ===================================================
router.get("/transcription-queue", async (_req, res, next) => {
  try {
    const result = await rawQuery(
      `SELECT
        COUNT(*) AS pending,
        MIN(CallInTime) AS oldestInQueue
      FROM outboundmaster
      WHERE RTRIM(Status) = 'P'`,
    );

    const row = result.recordset[0] || { pending: 0 };
    const avgWait = row.oldestInQueue
      ? Math.round((Date.now() - new Date(row.oldestInQueue).getTime()) / 1000)
      : 0;

    const historyResult = await rawQuery(
      `SELECT
        CAST(CallDate AS DATE) AS queueDate,
        COUNT(*) AS queueSize
      FROM outboundmaster
      WHERE RTRIM(Status) = 'P'
      GROUP BY CAST(CallDate AS DATE)
      ORDER BY queueDate DESC`,
    );

    res.json({
      current: row.pending,
      avgWaitSeconds: avgWait,
      history: historyResult.recordset.reverse().map((r) => ({
        time: new Date(r.queueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        }),
        value: r.queueSize,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// M14: Transcription Latency
// GET /api/dashboard/transcription-time
// ===================================================
router.get("/transcription-time", async (req, res, next) => {
  try {
    const filters = parseFilters(req);
    const dateParams = {};
    const dateConds = [];

    if (filters.from) {
      dateConds.push("om.CallDate >= @dateFrom");
      dateParams.dateFrom = {
        type: sql.DateTime,
        value: new Date(filters.from),
      };
    }
    if (filters.to) {
      dateConds.push("om.CallDate <= @dateTo");
      dateParams.dateTo = { type: sql.DateTime, value: new Date(filters.to) };
    }

    const extraWhere =
      dateConds.length > 0 ? `AND ${dateConds.join(" AND ")}` : "";

    const result = await query(
      `SELECT
        CAST(om.CallDate AS DATE) AS callDate,
        COUNT(*) AS count,
        AVG(DATEDIFF(MINUTE, om.CallInTime, GETDATE())) AS avgLatencyMin
      FROM outboundmaster om
      WHERE RTRIM(om.Status) = 'T'
      ${extraWhere}
      GROUP BY CAST(om.CallDate AS DATE)
      ORDER BY callDate`,
      dateParams,
    );

    const rows = result.recordset;
    const totalCount = rows.reduce((s, r) => s + r.count, 0);
    const overallAvg =
      totalCount > 0
        ? Math.round(
            rows.reduce((s, r) => s + r.avgLatencyMin * r.count, 0) /
              totalCount,
          )
        : 0;

    res.json({
      overallAvgMs: overallAvg * 60 * 1000,
      byVendor: [
        {
          vendor: "Auto Service",
          avgMs: overallAvg * 60 * 1000,
          count: totalCount,
        },
      ],
    });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// M15: Transcription Throughput
// GET /api/dashboard/transcription-api-usage
// ===================================================
router.get("/transcription-api-usage", async (req, res, next) => {
  try {
    const filters = parseFilters(req);
    const dateParams = {};
    const dateConds = [];

    if (filters.from) {
      dateConds.push("om.CallDate >= @dateFrom");
      dateParams.dateFrom = {
        type: sql.DateTime,
        value: new Date(filters.from),
      };
    }
    if (filters.to) {
      dateConds.push("om.CallDate <= @dateTo");
      dateParams.dateTo = { type: sql.DateTime, value: new Date(filters.to) };
    }

    const extraWhere =
      dateConds.length > 0 ? `AND ${dateConds.join(" AND ")}` : "";

    const result = await query(
      `SELECT
        CAST(om.CallDate AS DATE) AS usageDate,
        COUNT(*) AS transcribed,
        SUM(od_count.detailCount) AS totalClaims
      FROM outboundmaster om
      CROSS APPLY (
        SELECT COUNT(*) AS detailCount
        FROM outboundmaster_detail od
        WHERE od.OID = om.ID
      ) od_count
      WHERE RTRIM(om.Status) = 'T'
      ${extraWhere}
      GROUP BY CAST(om.CallDate AS DATE)
      ORDER BY usageDate`,
      dateParams,
    );

    res.json({
      vendors: [
        {
          vendor: "Auto Service",
          daily: result.recordset.map((r) => ({
            date: new Date(r.usageDate).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
            }),
            calls: r.transcribed,
            chars: r.totalClaims,
          })),
          totalCalls: result.recordset.reduce((s, r) => s + r.transcribed, 0),
          totalChars: result.recordset.reduce((s, r) => s + r.totalClaims, 0),
        },
      ],
    });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// M16: Concurrent / Peak Call Volume
// GET /api/dashboard/concurrent-peaks
// ===================================================
router.get("/concurrent-peaks", async (req, res, next) => {
  try {
    const filters = parseFilters(req);
    const { whereSQL, params } = buildWhereClause(filters);

    const result = await query(
      `SELECT
        CAST(om.CallDate AS DATE) AS callDate,
        DATEPART(HOUR, om.CallInTime) AS hour,
        COUNT(od.ID) AS concurrent
      FROM outboundmaster om
      INNER JOIN outboundmaster_detail od ON od.OID = om.ID
      ${whereSQL}
      GROUP BY CAST(om.CallDate AS DATE), DATEPART(HOUR, om.CallInTime)
      ORDER BY callDate, hour`,
      params,
    );

    const rows = result.recordset;
    const peakRow = rows.reduce(
      (max, r) => (r.concurrent > (max?.concurrent || 0) ? r : max),
      null,
    );

    res.json({
      peak: peakRow
        ? {
            date: new Date(peakRow.callDate).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
            }),
            hour: `${String(peakRow.hour).padStart(2, "0")}:00`,
            concurrent: peakRow.concurrent,
          }
        : null,
      capacity: 500,
      hourly: rows.map((r) => ({
        date: new Date(r.callDate).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        }),
        hour: `${String(r.hour).padStart(2, "0")}:00`,
        concurrent: r.concurrent,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// M17: System Error Rate
// GET /api/dashboard/error-rate
// F=Fail, G=Google error, E=Empty, R=Redial/Failed
// ===================================================
router.get("/error-rate", async (req, res, next) => {
  try {
    const filters = parseFilters(req);
    const { whereSQL, params } = buildWhereClause(filters);

    const result = await query(
      `SELECT
        CAST(om.CallDate AS DATE) AS callDate,
        COUNT(od.ID) AS total,
        SUM(CASE WHEN RTRIM(od.Status) IN ('F','G','E','R') THEN 1 ELSE 0 END) AS errors
      FROM outboundmaster om
      INNER JOIN outboundmaster_detail od ON od.OID = om.ID
      ${whereSQL}
      GROUP BY CAST(om.CallDate AS DATE)
      ORDER BY callDate`,
      params,
    );

    const rows = result.recordset;
    const totalAll = rows.reduce((s, r) => s + r.total, 0);
    const totalErrors = rows.reduce((s, r) => s + r.errors, 0);
    const rate =
      totalAll > 0
        ? parseFloat(((totalErrors / totalAll) * 100).toFixed(2))
        : 0;

    // Error breakdown by type
    const breakdownResult = await query(
      `SELECT
        RTRIM(od.Status) AS statusCode,
        COALESCE(ocs.Description, RTRIM(od.Status)) AS ErrorType,
        COUNT(od.ID) AS count
      FROM outboundmaster om
      INNER JOIN outboundmaster_detail od ON od.OID = om.ID
      LEFT JOIN outboundCallStatus ocs ON RTRIM(od.Status) = RTRIM(ocs.CallStatus)
      ${whereSQL ? `${whereSQL} AND` : "WHERE"} RTRIM(od.Status) IN ('F','G','E','R')
      GROUP BY RTRIM(od.Status), COALESCE(ocs.Description, RTRIM(od.Status))
      ORDER BY COUNT(od.ID) DESC`,
      params,
    );

    res.json({
      rate,
      totalErrors,
      totalCalls: totalAll,
      trendData: rows.map((r) => ({
        date: new Date(r.callDate).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        }),
        value:
          r.total > 0 ? parseFloat(((r.errors / r.total) * 100).toFixed(2)) : 0,
      })),
      breakdown: breakdownResult.recordset.map((r) => ({
        type: r.ErrorType,
        count: r.count,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ===================================================
// Filter Options Endpoint
// GET /api/dashboard/filter-options
// Returns distinct values for dropdown filters
// ===================================================
router.get("/filter-options", async (_req, res, next) => {
  try {
    const [insResult, practResult, dnisResult] = await Promise.all([
      rawQuery(
        `SELECT TOP 50 ${INS_EXPR} AS val, COUNT(*) AS cnt
         FROM outboundmaster om
         INNER JOIN outboundmaster_detail od ON od.OID = om.ID
         WHERE od.UniqueIndetifier IS NOT NULL
         GROUP BY ${INS_EXPR}
         ORDER BY COUNT(*) DESC`,
      ),
      rawQuery(
        `SELECT DISTINCT RTRIM(od.PracticeCode) AS val
         FROM outboundmaster_detail od
         WHERE od.PracticeCode IS NOT NULL AND od.PracticeCode != ''
         ORDER BY val`,
      ),
      rawQuery(
        `SELECT DISTINCT RTRIM(od.IVR_Insurance) AS val
         FROM outboundmaster_detail od
         WHERE od.IVR_Insurance IS NOT NULL AND od.IVR_Insurance != ''
         ORDER BY val`,
      ),
    ]);

    res.json({
      insurances: insResult.recordset.map((r) => r.val).filter(Boolean),
      practices: practResult.recordset.map((r) => r.val).filter(Boolean),
      dnis: dnisResult.recordset.map((r) => r.val).filter(Boolean),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
