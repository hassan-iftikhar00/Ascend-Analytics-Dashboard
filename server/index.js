/**
 * Express API Server — IVR Analytics Portal
 * Connects to SQL Server and serves data to the React frontend.
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getPool, closePool } from "./db.js";
import schemaRouter from "./routes/schema.js";
import dashboardRouter from "./routes/dashboard.js";
import operationsRouter from "./routes/operations.js";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;

// ── Middleware ──
app.use(cors());
app.use(express.json());

// Request logging (dev)
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

// ── Routes ──
app.use("/api/schema", schemaRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/operations", operationsRouter);

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT 1 AS ok");
    res.json({
      status: "ok",
      db: result.recordset[0]?.ok === 1 ? "connected" : "error",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", db: "disconnected", error: err.message });
  }
});

// ── Global error handler ──
app.use((err, _req, res, _next) => {
  console.error("❌ Server error:", err.message);
  res.status(500).json({ error: err.message });
});

// ── Start ──
app.listen(PORT, async () => {
  console.log(`\n🚀 API server running on http://localhost:${PORT}`);
  console.log(`📊 Schema explorer: http://localhost:${PORT}/api/schema/tables`);
  console.log(`❤️  Health check:    http://localhost:${PORT}/api/health\n`);

  // Test DB connection on startup
  try {
    await getPool();
  } catch (err) {
    console.error(
      "⚠️  DB connection failed on startup — endpoints will retry on demand",
    );
  }
});

// ── Graceful shutdown ──
process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  await closePool();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closePool();
  process.exit(0);
});
