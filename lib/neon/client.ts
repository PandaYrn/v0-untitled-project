import { neon } from "@neondatabase/serverless"

// Get the database URL from environment variables
// Check multiple possible environment variable names
const getDatabaseUrl = () => {
  const possibleEnvVars = [
    process.env.DATABASE_URL,
    process.env.NEON_DATABASE_URL,
    process.env.NEON_POSTGRES_URL,
    process.env.POSTGRES_URL,
    process.env.NEON_NEON_DATABASE_URL,
  ]

  // Find the first defined environment variable
  const databaseUrl = possibleEnvVars.find(url => url !== undefined)

  if (!databaseUrl) {
    console.warn(
      "No database URL found in environment variables. Using dummy URL for development. This will not connect to a real database."
    )
    // Return a dummy URL for development
    return "postgresql://user:password@localhost:5432/soundwave"
  }

  return databaseUrl
}

// Create a SQL client with the database URL
export const sql = neon(getDatabaseUrl())

// Execute a query with error handling
export async function executeQuery<T>(query: string, params: any[] = []): Promise<T[]> {
  try {
    return await sql(query, params) as T[]
  } catch (error) {
    console.error("Database query error:", error)
    return [] as T[]
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`
    return true
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}
