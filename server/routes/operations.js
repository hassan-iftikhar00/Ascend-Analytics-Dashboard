/**
 * Operations API Routes - Paginated call log table
 *
 * GET /api/operations/logs?page=1&size=50&sort=CallDate&dir=desc&search=...
 *
 * Joins outboundmaster + outboundmaster_detail + outboundCallStatus
 */
import { Router } from "express";
import { query, sql } from "../db.js";

const router = Router();

const INS_EXPR = "LEFT(od.UniqueIndetifier, CHARINDEX(N'_', od.UniqueIndetifier + N'_') - 1)";

// Column alias -> real SQL expression (for sorting)
const SORT_MAP = {
  CallDate: "om.CallDate",
  CallInTime: "om.CallInTime",
  CallID: "od.ID",
  Insurance: INS_EXPR,
  DNIS: "od.IVR_Insurance",
  Practice: "od.PracticeCode",
  Status: "od.Status",
  ClaimNo: "od.ClaimNo",
  NoOfClaims: "od.NoOfClaims",
  UniqueId: "od.UniqueIndetifier",
  BatchStatus: "om.Status",
};

const ALLOWED_SORT = Object.keys(SORT_MAP);

router.get("/logs", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(200, Math.max(1, parseInt(req.query.size, 10) || 50));
    const sortKey = ALLOWED_SORT.includes(req.query.sort) ? req.query.sort : "CallDate";
    const sortExpr = SORT_MAP[sortKey];
    const sortDir = req.query.dir === "asc" ? "ASC" : "DESC";
    const search = req.query.search || "";
    const offset = (page - 1) * pageSize;

    // Parse filters
    const from = req.query.from || null;
    const to = req.query.to || null;
    const insurance = req.query.insurance ? req.query.insurance.split(",") : [];
    const practice = req.query.practice ? req.query.practice.split(",") : [];
    const dnis = req.query.dnis ? req.query.dnis.split(",") : [];
    const statusFilter = req.query.status ? req.query.status.split(",") : [];

    // Build WHERE conditions
    const conditions = [];
    const params = {};

    if (from) {
      conditions.push("om.CallDate >= @dateFrom");
      params.dateFrom = { type: sql.DateTime, value: new Date(from) };
    }
    if (to) {
      conditions.push("om.CallDate <= @dateTo");
      params.dateTo = { type: sql.DateTime, value: new Date(to) };
    }
    if (insurance.length > 0) {
      const orConds = insurance.map((_, i) => `od.UniqueIndetifier LIKE @ins${i} + N'_%'`);
      conditions.push(`(${orConds.join(" OR ")})`);
      insurance.forEach((v, i) => {
        params[`ins${i}`] = { type: sql.NVarChar, value: v };
      });
    }
    if (practice.length > 0) {
      conditions.push(
        `od.PracticeCode IN (${practice.map((_, i) => `@prac${i}`).join(",")})`,
      );
      practice.forEach((v, i) => {
        params[`prac${i}`] = { type: sql.NVarChar, value: v };
      });
    }
    if (dnis.length > 0) {
      conditions.push(
        `RTRIM(od.IVR_Insurance) IN (${dnis.map((_, i) => `@dnis${i}`).join(",")})`,
      );
      dnis.forEach((v, i) => {
        params[`dnis${i}`] = { type: sql.NVarChar, value: v };
      });
    }
    if (statusFilter.length > 0) {
      conditions.push(
        `RTRIM(od.Status) IN (${statusFilter.map((_, i) => `@st${i}`).join(",")})`,
      );
      statusFilter.forEach((v, i) => {
        params[`st${i}`] = { type: sql.NVarChar, value: v };
      });
    }
    if (search) {
      conditions.push(
        `(od.ClaimNo LIKE N'%' + @search + N'%'
          OR od.UniqueIndetifier LIKE N'%' + @search + N'%'
          OR RTRIM(od.IVR_Insurance) LIKE N'%' + @search + N'%'
          OR od.Transcription LIKE N'%' + @search + N'%'
          OR CAST(od.ID AS VARCHAR) = @search)`,
      );
      params.search = { type: sql.NVarChar, value: search };
    }

    const whereSQL = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count total
    const countResult = await query(
      `SELECT COUNT(*) AS total
       FROM outboundmaster om
       INNER JOIN outboundmaster_detail od ON od.OID = om.ID
       ${whereSQL}`,
      params,
    );
    const total = countResult.recordset[0]?.total || 0;

    // Fetch page
    const dataResult = await query(
      `SELECT
        od.ID AS CallID,
        CAST(om.CallDate AS DATE) AS CallDate,
        om.CallInTime,
        RTRIM(od.IVR_Insurance) AS DNIS,
        RTRIM(od.IVR_Ascend) AS AscendExt,
        ${INS_EXPR} AS Insurance,
        RTRIM(od.PracticeCode) AS Practice,
        RTRIM(od.Status) AS Status,
        COALESCE(ocs.Description, 'Status: ' + RTRIM(od.Status)) AS StatusDescription,
        od.ClaimNo,
        od.NoOfClaims,
        RTRIM(od.UniqueIndetifier) AS UniqueId,
        RTRIM(om.Status) AS BatchStatus,
        LEFT(od.Transcription, 200) AS TranscriptionPreview
      FROM outboundmaster om
      INNER JOIN outboundmaster_detail od ON od.OID = om.ID
      LEFT JOIN outboundCallStatus ocs ON RTRIM(od.Status) = RTRIM(ocs.CallStatus)
      ${whereSQL}
      ORDER BY ${sortExpr} ${sortDir}
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
      {
        ...params,
        offset: { type: sql.Int, value: offset },
        pageSize: { type: sql.Int, value: pageSize },
      },
    );

    res.json({
      rows: dataResult.recordset,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/operations/detail/:id - Get full detail for a single call record
router.get("/detail/:id", async (req, res, next) => {
  try {
    const detailResult = await query(
      `SELECT
        od.ID AS CallID,
        CAST(om.CallDate AS DATE) AS CallDate,
        om.CallInTime,
        RTRIM(od.IVR_Insurance) AS DNIS,
        RTRIM(od.IVR_Ascend) AS AscendExt,
        ${INS_EXPR} AS Insurance,
        RTRIM(od.PracticeCode) AS Practice,
        RTRIM(od.Status) AS Status,
        COALESCE(ocs.Description, RTRIM(od.Status)) AS StatusDescription,
        od.ClaimNo,
        od.NoOfClaims,
        RTRIM(od.UniqueIndetifier) AS UniqueId,
        RTRIM(om.Status) AS BatchStatus,
        RTRIM(om.Remarks) AS BatchRemarks,
        od.Transcription
      FROM outboundmaster om
      INNER JOIN outboundmaster_detail od ON od.OID = om.ID
      LEFT JOIN outboundCallStatus ocs ON RTRIM(od.Status) = RTRIM(ocs.CallStatus)
      WHERE od.ID = @callId`,
      { callId: { type: sql.Int, value: parseInt(req.params.id, 10) } },
    );

    if (detailResult.recordset.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Also fetch EAV data from outboundmaster_detail_data
    const eavResult = await query(
      `SELECT Name AS promptId, Value
       FROM outboundmaster_detail_data
       WHERE DID = @callId
       ORDER BY Name`,
      { callId: { type: sql.Int, value: parseInt(req.params.id, 10) } },
    );

    res.json({
      ...detailResult.recordset[0],
      detailData: eavResult.recordset,
    });
  } catch (err) {
    next(err);
  }
});

export default router;