import { type NextRequest, NextResponse } from "next/server"
import { seedAnalyticsData } from "@/scripts/seed-analytics"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if user is authenticated and is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const result = await seedAnalyticsData()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in seed analytics API:", error)
    return NextResponse.json({ error: "Failed to seed analytics data" }, { status: 500 })
  }
}
