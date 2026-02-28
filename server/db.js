/**
 * SQL Server Connection Pool
 * Singleton pool reused across all routes for connection efficiency.
 */
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT !== "false",
  },
  pool: {
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 60000, // 60s for heavy queries
  connectionTimeout: 15000,
};

let pool = null;

/**
 * Get or create the singleton connection pool
 */
export async function getPool() {
  if (pool) return pool;
  try {
    pool = await sql.connect(config);
    console.log(
      `✅ Connected to SQL Server: ${config.server}/${config.database}`,
    );
    pool.on("error", (err) => {
      console.error("❌ Pool error:", err.message);
      pool = null;
    });
    return pool;
  } catch (err) {
    console.error("❌ SQL Server connection failed:", err.message);
    pool = null;
    throw err;
  }
}

/**
 * Run a parameterized query safely
 * @param {string} queryText - SQL query with @param placeholders
 * @param {Object} params - { name: { type: sql.VarChar, value: 'x' } }
 */
export async function query(queryText, params = {}) {
  const p = await getPool();
  const request = p.request();
  for (const [name, { type, value }] of Object.entries(params)) {
    request.input(name, type, value);
  }
  return request.query(queryText);
}

/**
 * Convenience: run raw SQL (no params) — use only for safe/internal queries
 */
export async function rawQuery(queryText) {
  const p = await getPool();
  return p.request().query(queryText);
}

/**
 * Close the pool (for graceful shutdown)
 */
export async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
    console.log("🔌 SQL Server pool closed");
  }
}

export { sql };
