/**
 * Schema Explorer Routes
 * Lets you browse the database structure from the browser
 * to discover which tables/columns map to IVR metrics.
 *
 * GET /api/schema/tables          — List all tables with row counts
 * GET /api/schema/tables/:name    — Get columns for a specific table
 * GET /api/schema/preview/:name   — Preview first 50 rows of a table
 * GET /api/schema/search?q=term   — Search column names across all tables
 */
import { Router } from "express";
import { rawQuery, sql, query } from "../db.js";

const router = Router();

// ── List all tables with row counts ──
router.get("/tables", async (_req, res, next) => {
  try {
    const result = await rawQuery(`
      SELECT 
        s.name AS [schema],
        t.name AS [table],
        p.rows AS [rowCount]
      FROM sys.tables t
      INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
      INNER JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0, 1)
      ORDER BY p.rows DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

// ── Get columns for a specific table ──
router.get("/tables/:name", async (req, res, next) => {
  try {
    const tableName = req.params.name;
    const result = await rawQuery(`
      SELECT 
        c.name AS [column],
        ty.name AS [type],
        c.max_length AS [maxLength],
        c.is_nullable AS [nullable],
        c.is_identity AS [identity],
        CASE WHEN pk.column_id IS NOT NULL THEN 1 ELSE 0 END AS [primaryKey]
      FROM sys.columns c
      INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
      LEFT JOIN (
        SELECT ic.object_id, ic.column_id
        FROM sys.index_columns ic
        INNER JOIN sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id
        WHERE i.is_primary_key = 1
      ) pk ON c.object_id = pk.object_id AND c.column_id = pk.column_id
      WHERE c.object_id = OBJECT_ID(N'${tableName.replace(/[^a-zA-Z0-9_.[\]]/g, "")}')
      ORDER BY c.column_id
    `);
    res.json({
      table: tableName,
      columns: result.recordset,
    });
  } catch (err) {
    next(err);
  }
});

// ── Preview first N rows of a table ──
router.get("/preview/:name", async (req, res, next) => {
  try {
    const tableName = req.params.name.replace(/[^a-zA-Z0-9_.[\]]/g, "");
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);
    const result = await rawQuery(`SELECT TOP ${limit} * FROM [${tableName}]`);
    res.json({
      table: tableName,
      rowCount: result.recordset.length,
      columns:
        result.recordset.length > 0 ? Object.keys(result.recordset[0]) : [],
      rows: result.recordset,
    });
  } catch (err) {
    next(err);
  }
});

// ── Search column names across all tables ──
router.get("/search", async (req, res, next) => {
  try {
    const q = req.query.q || "";
    if (!q) return res.json([]);

    const result = await query(
      `
      SELECT 
        s.name AS [schema],
        t.name AS [table],
        c.name AS [column],
        ty.name AS [type]
      FROM sys.columns c
      INNER JOIN sys.tables t ON c.object_id = t.object_id
      INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
      INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
      WHERE c.name LIKE '%' + @searchTerm + '%'
         OR t.name LIKE '%' + @searchTerm + '%'
      ORDER BY t.name, c.column_id
      `,
      { searchTerm: { type: sql.NVarChar, value: q } },
    );
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

export default router;
