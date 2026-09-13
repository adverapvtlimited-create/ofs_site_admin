import { Pool } from 'pg';

// Create a new PostgreSQL connection pool
// This ensures that database connections are reused across Next.js API requests.
const globalForPg = global;

const pool = globalForPg.pgPool || new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Max number of connections in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pool;
}

export default pool;

export async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}
