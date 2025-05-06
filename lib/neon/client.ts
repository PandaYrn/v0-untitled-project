import { neon, neonConfig } from "@neondatabase/serverless"
import { Pool } from "@neondatabase/serverless"

// Configure neon to use WebSockets for better connection management
neonConfig.webSocketConstructor = globalThis.WebSocket
neonConfig.fetchConnectionCache = true

// Get the database URL from environment variables with fallback
const getDatabaseUrl = () => {
  // Check for various possible environment variable names
  const possibleEnvVars = [
    process.env.NEON_NEON_DATABASE_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.NEON_POSTGRES_URL,
  ]

  const databaseUrl = possibleEnvVars.find((url) => url && url.length > 0)

  if (!databaseUrl) {
    console.warn("No database URL found in environment variables. Using dummy URL for development.")
    return "postgres://localhost:5432/dummy" // Dummy URL for development
  }

  return databaseUrl
}

// Create a connection pool with error handling
let pool: Pool | null = null
try {
  pool = new Pool({
    connectionString: getDatabaseUrl(),
  })
} catch (error) {
  console.error("Failed to create database pool:", error)
}

/**
 * Execute a SQL query against the Neon database
 */
export async function executeQuery(query: string, params: any[] = []) {
  if (!pool) {
    console.error("Database pool not initialized")
    return []
  }

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
    // Return empty array instead of throwing to prevent page crashes
    return []
  }
}

/**
 * Execute a SQL query with a direct connection (for one-off queries)
 */
export async function executeDirectQuery(query: string, params: any[] = []) {
  try {
    const sql = neon(getDatabaseUrl())
    return await sql(query, params)
  } catch (error) {
    console.error("Direct database query error:", error)
    // Return empty array instead of throwing to prevent page crashes
    return []
  }
}
