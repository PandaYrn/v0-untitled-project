import { type NextRequest, NextResponse } from "next/server"
import { trackEngagement } from "@/lib/analytics/track"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, eventType, contentId, metadata } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!eventType) {
      return NextResponse.json({ error: "Event type is required" }, { status: 400 })
    }

    const result = await trackEngagement({
      userId,
      eventType,
      contentId,
      metadata,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in engagement API:", error)
    return NextResponse.json({ error: "Failed to track engagement" }, { status: 500 })
  }
}
