import { type NextRequest, NextResponse } from "next/server"
import { trackContentView } from "@/lib/analytics/track"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentId, userId, viewDuration, platform, referrer } = body

    if (!contentId) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 })
    }

    // Generate a session ID if not provided
    const sessionId = body.sessionId || uuidv4()

    // Get country from request headers or IP
    const country = request.headers.get("x-country") || null

    const result = await trackContentView({
      contentId,
      userId,
      sessionId,
      viewDuration,
      platform,
      country,
      referrer,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in content view API:", error)
    return NextResponse.json({ error: "Failed to track content view" }, { status: 500 })
  }
}
