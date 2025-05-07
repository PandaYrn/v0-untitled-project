import { neon } from "@neondatabase/serverless"
import { Pool } from "@neondatabase/serverless"

// Get the database URL from environment variables
const getDatabaseUrl = () => {
  // Check for various possible environment variable names
  const possibleEnvVars = [
    process.env.NEON_NEON_DATABASE_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.NEON_POSTGRES_URL,
    process.env.NEON_NEON_DATABASE_URL,
  ]

  // Find the first defined environment variable
  const databaseUrl = possibleEnvVars.find((url) => url && url.length > 0)

  if (!databaseUrl) {
    console.warn("No database URL found in environment variables")
    return "postgres://localhost:5432/dummy"
  }

  return databaseUrl
}

// Create a SQL client
export const sql = neon(getDatabaseUrl())

// Create a connection pool
let pool = null
try {
  pool = new Pool({ connectionString: getDatabaseUrl() })
} catch (error) {
  console.error("Failed to create database pool:", error)
}

// Execute a query using the pool
export async function executeQuery(query, params = []) {
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
    return []
  }
}

// Test database connection
export async function testConnection() {
  try {
    await sql`SELECT 1`
    return true
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}
