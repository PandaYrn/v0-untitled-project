import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// GET: Get user profile by username
export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const username = params.username
    const supabase = createServerSupabaseClient()

    // Fetch profile with extended data
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        content:content(id, title, content_type, thumbnail_url, created_at),
        followers:user_followers!follower_id(count),
        following:user_followers!user_id(count)
      `)
      .eq("username", username)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 })
      }
      throw error
    }

    // Get current user to check if following
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let isFollowing = false
    if (user) {
      const { data: followData } = await supabase
        .from("user_followers")
        .select("id")
        .eq("user_id", data.id)
        .eq("follower_id", user.id)
        .single()

      isFollowing = !!followData
    }

    return NextResponse.json({
      ...data,
      isFollowing,
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
