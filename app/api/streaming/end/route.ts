import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

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
    const { sessionId, duration } = body

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Update streaming session
    const { error: sessionError } = await supabase
      .from("streaming_sessions")
      .update({
        status: "completed",
        duration: duration || 0,
        ended_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .eq("user_id", user.id)

    if (sessionError) throw sessionError

    // Update content view with duration
    await fetch(`${request.nextUrl.origin}/api/analytics/content-view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        viewDuration: duration,
      }),
    })

    return NextResponse.json({
      success: true,
      message: "Streaming session ended",
    })
  } catch (error) {
    console.error("Error ending streaming session:", error)
    return NextResponse.json({ error: "Failed to end streaming session" }, { status: 500 })
  }
}
