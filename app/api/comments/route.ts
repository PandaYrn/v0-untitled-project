import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

// GET: Fetch comments for a content
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const contentId = searchParams.get("contentId")

    if (!contentId) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id(id, username, avatar_url)
      `)
      .eq("content_id", contentId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

// POST: Add a new comment
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { contentId, text } = body

    if (!contentId || !text) {
      return NextResponse.json({ error: "Content ID and text are required" }, { status: 400 })
    }

    // Create comment
    const commentId = uuidv4()
    const { error } = await supabase.from("comments").insert({
      id: commentId,
      content_id: contentId,
      user_id: user.id,
      text,
    })

    if (error) throw error

    // Track engagement
    await fetch(`${request.nextUrl.origin}/api/analytics/engagement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        eventType: "comment",
        contentId,
        metadata: { commentId },
      }),
    })

    return NextResponse.json({
      success: true,
      message: "Comment added successfully",
      commentId,
    })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}
