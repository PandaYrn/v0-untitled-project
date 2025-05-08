import { NextResponse } from "next/server"
import { sql } from "@/lib/neon/client"
import fs from "fs"
import path from "path"

export async function POST() {
  try {
    // Read the SQL script
    const scriptPath = path.join(process.cwd(), "scripts", "create-schema.sql")
    const sqlScript = fs.readFileSync(scriptPath, "utf8")

    // Execute the SQL script
    await sql.query(sqlScript)

    return NextResponse.json({
      success: true,
      message: "Database schema created successfully",
    })
  } catch (error) {
    console.error("Error setting up database schema:", error)
    return NextResponse.json(
      {
        error: "Failed to set up database schema",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
