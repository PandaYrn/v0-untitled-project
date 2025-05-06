import { neon, neonConfig } from "@neondatabase/serverless"
import { Pool } from "@neondatabase/serverless"

// Configure neon to use WebSockets for better connection management
neonConfig.webSocketConstructor = globalThis.WebSocket
neonConfig.fetchConnectionCache = true

// Create a connection pool
const pool = new Pool({ connectionString: process.env.NEON_NEON_DATABASE_URL })

/**
 * Execute a SQL query against the Neon database
 */
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const client = await pool.connect()
    try {
      const result = await client.query(query, params)
      return result.rows
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

/**
 * Execute a SQL query with a direct connection (for one-off queries)
 */
export async function executeDirectQuery(query: string, params: any[] = []) {
  const sql = neon(process.env.NEON_DATABASE_URL!)
  return sql(query, params)
}
