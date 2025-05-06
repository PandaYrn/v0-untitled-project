import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get content stats
    const { data: contentStats, error: contentError } = await supabase
      .from("content")
      .select("content_type, count")
      .eq("creator_id", user.id)
      .group("content_type")

    if (contentError) throw contentError

    // Get total views from analytics
    const { data: viewsData, error: viewsError } = await supabase
      .from("analytics.content_views")
      .select("content_id, count")
      .in("content_id", (query) => {
        query.select("id").from("content").eq("creator_id", user.id)
      })
      .group("content_id")

    if (viewsError) throw viewsError

    // Get revenue data
    const { data: revenueData, error: revenueError } = await supabase
      .from("analytics.transactions")
      .select("transaction_type, sum(creator_revenue)")
      .eq("user_id", user.id)
      .group("transaction_type")

    if (revenueError) throw revenueError

    // Get recent purchases
    const { data: purchasesData, error: purchasesError } = await supabase
      .from("purchases")
      .select(`
        *,
        content:content_id(title, content_type, thumbnail_url),
        profiles:user_id(username, avatar_url)
      `)
      .in("content_id", (query) => {
        query.select("id").from("content").eq("creator_id", user.id)
      })
      .order("created_at", { ascending: false })
      .limit(5)

    if (purchasesError) throw purchasesError

    // Get upcoming events
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("creator_id", user.id)
      .gt("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(3)

    if (eventsError) throw eventsError

    return NextResponse.json({
      contentStats,
      views: viewsData,
      revenue: revenueData,
      recentPurchases: purchasesData,
      upcomingEvents: eventsData,
    })
  } catch (error) {
    console.error("Error fetching creator dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
