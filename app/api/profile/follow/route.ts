import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

// POST: Follow a user
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
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from("user_followers")
      .select("id")
      .eq("user_id", userId)
      .eq("follower_id", user.id)
      .single()

    if (existingFollow) {
      return NextResponse.json({
        success: true,
        message: "Already following this user",
      })
    }

    // Create follow relationship
    const { error } = await supabase.from("user_followers").insert({
      id: uuidv4(),
      user_id: userId,
      follower_id: user.id,
    })

    if (error) throw error

    // Track engagement
    await fetch(`${request.nextUrl.origin}/api/analytics/engagement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        eventType: "follow",
        metadata: { targetUserId: userId },
      }),
    })

    return NextResponse.json({
      success: true,
      message: "User followed successfully",
    })
  } catch (error) {
    console.error("Error following user:", error)
    return NextResponse.json({ error: "Failed to follow user" }, { status: 500 })
  }
}

// DELETE: Unfollow a user
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Delete follow relationship
    const { error } = await supabase.from("user_followers").delete().eq("user_id", userId).eq("follower_id", user.id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "User unfollowed successfully",
    })
  } catch (error) {
    console.error("Error unfollowing user:", error)
    return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 })
  }
}
