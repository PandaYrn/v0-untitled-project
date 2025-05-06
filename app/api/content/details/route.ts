import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentIds } = body

    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      return NextResponse.json({ error: "Content IDs are required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("content").select("id, title, content_type").in("id", contentIds)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching content details:", error)
    return NextResponse.json({ error: "Failed to fetch content details" }, { status: 500 })
  }
}
