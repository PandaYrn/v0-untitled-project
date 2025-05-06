import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

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
    const { contentId, quality } = body

    if (!contentId) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 })
    }

    // Check if content exists and if it's premium
    const { data: content } = await supabase
      .from("content")
      .select("id, is_premium, creator_id")
      .eq("id", contentId)
      .single()

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    // If premium content, check if user has purchased it
    if (content.is_premium && content.creator_id !== user.id) {
      const { data: purchase } = await supabase
        .from("purchases")
        .select("id")
        .eq("content_id", contentId)
        .eq("user_id", user.id)
        .single()

      if (!purchase) {
        return NextResponse.json({ error: "Purchase required to stream this content" }, { status: 403 })
      }
    }

    // Create streaming session
    const sessionId = uuidv4()
    const { error: sessionError } = await supabase.from("streaming_sessions").insert({
      id: sessionId,
      content_id: contentId,
      user_id: user.id,
      quality: quality || "hd",
      status: "active",
    })

    if (sessionError) throw sessionError

    // Track content view
    await fetch(`${request.nextUrl.origin}/api/analytics/content-view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentId,
        userId: user.id,
        sessionId,
        platform: "web",
        referrer: request.headers.get("referer"),
      }),
    })

    // If it's a premium content by another creator, track royalty payment
    if (content.is_premium && content.creator_id !== user.id) {
      // Calculate streaming royalty (e.g., $0.001 per stream)
      const royaltyAmount = 0.001

      await fetch(`${request.nextUrl.origin}/api/analytics/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: content.creator_id,
          contentId,
          transactionType: "streaming_royalty",
          amount: royaltyAmount,
          paymentMethod: "wallet",
        }),
      })
    }

    return NextResponse.json({
      success: true,
      message: "Streaming session started",
      sessionId,
      streamUrl: `https://stream.example.com/${contentId}?session=${sessionId}&quality=${quality || "hd"}`,
    })
  } catch (error) {
    console.error("Error starting streaming session:", error)
    return NextResponse.json({ error: "Failed to start streaming session" }, { status: 500 })
  }
}
