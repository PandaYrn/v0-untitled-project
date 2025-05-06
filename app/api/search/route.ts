import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")
    const type = searchParams.get("type") // all, content, users, events
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const searchTerm = `%${query}%`

    const results: any = { query }

    // Search content
    if (type === "all" || type === "content") {
      const { data: contentData, error: contentError } = await supabase
        .from("content")
        .select(`
          *,
          profiles:creator_id(id, username, full_name, avatar_url)
        `)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(limit)

      if (contentError) throw contentError
      results.content = contentData
    }

    // Search users
    if (type === "all" || type === "users") {
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.${searchTerm},full_name.ilike.${searchTerm},bio.ilike.${searchTerm}`)
        .limit(limit)

      if (userError) throw userError
      results.users = userData
    }

    // Search events
    if (type === "all" || type === "events") {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select(`
          *,
          profiles:creator_id(id, username, full_name, avatar_url)
        `)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`)
        .limit(limit)

      if (eventError) throw eventError
      results.events = eventData
    }

    // Track search engagement
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await fetch(`${request.nextUrl.origin}/api/analytics/engagement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          eventType: "search",
          metadata: { query, type },
        }),
      })
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error searching:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
