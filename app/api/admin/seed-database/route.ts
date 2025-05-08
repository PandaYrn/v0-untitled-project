import { NextResponse } from "next/server"
import { seedDatabase } from "@/scripts/seed-database"

export async function POST() {
  try {
    const result = await seedDatabase()

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          details: result.details,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      stats: result.stats,
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      {
        error: "Failed to seed database",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
