import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// GET: Get current user profile
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

    // Fetch profile with extended data
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        content:content(id, title, content_type, thumbnail_url, created_at),
        followers:user_followers!follower_id(count),
        following:user_followers!user_id(count)
      `)
      .eq("id", user.id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

// PATCH: Update user profile
export async function PATCH(request: NextRequest) {
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
    const { username, full_name, bio, website, avatar_url, social_links } = body

    // Validate username if provided
    if (username) {
      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", user.id)
        .single()

      if (existingUser) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 })
      }
    }

    // Update profile
    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        full_name,
        bio,
        website,
        avatar_url,
        social_links,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
