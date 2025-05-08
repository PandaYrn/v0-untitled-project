import { NextResponse } from "next/server"
import { seedDatabase } from "@/scripts/seed-database"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    // Check if user is authenticated and is an admin
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // In a real app, you would check if the user has admin privileges
    // For now, we'll allow any authenticated user to seed the data

    // Seed the database
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
