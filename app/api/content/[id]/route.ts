import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// GET: Fetch a single content item by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contentId = params.id
    const supabase = createServerSupabaseClient()

    // Fetch content with related data
    const { data, error } = await supabase
      .from("content")
      .select(`
        *,
        profiles:creator_id(id, username, full_name, avatar_url),
        genres:content_genres(genres(*)),
        comments(*, profiles:user_id(id, username, avatar_url))
      `)
      .eq("id", contentId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Content not found" }, { status: 404 })
      }
      throw error
    }

    // Track view if query param is set
    const trackView = request.nextUrl.searchParams.get("track") === "true"
    if (trackView) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Call analytics API to track view
      await fetch(`${request.nextUrl.origin}/api/analytics/content-view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId,
          userId: user?.id,
          platform: "web",
          referrer: request.headers.get("referer"),
        }),
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}

// PATCH: Update content
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contentId = params.id
    const supabase = createServerSupabaseClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is the content creator or an admin
    const { data: content } = await supabase.from("content").select("creator_id").eq("id", contentId).single()

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    // Check if user is authorized to update
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (content.creator_id !== user.id && profile?.role !== "admin") {
      return NextResponse.json({ error: "Not authorized to update this content" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, price, is_premium, genres, thumbnail_url, duration, release_date } = body

    // Update content record
    const { error: updateError } = await supabase
      .from("content")
      .update({
        title,
        description,
        price,
        is_premium,
        thumbnail_url,
        duration,
        release_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", contentId)

    if (updateError) throw updateError

    // Update genres if provided
    if (genres && genres.length > 0) {
      // First delete existing genre links
      await supabase.from("content_genres").delete().eq("content_id", contentId)

      // Then insert new ones
      const genreLinks = genres.map((genreId) => ({
        content_id: contentId,
        genre_id: genreId,
      }))

      const { error: genreError } = await supabase.from("content_genres").insert(genreLinks)

      if (genreError) throw genreError
    }

    return NextResponse.json({
      success: true,
      message: "Content updated successfully",
    })
  } catch (error) {
    console.error("Error updating content:", error)
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 })
  }
}

// DELETE: Remove content
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contentId = params.id
    const supabase = createServerSupabaseClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is the content creator or an admin
    const { data: content } = await supabase.from("content").select("creator_id").eq("id", contentId).single()

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    // Check if user is authorized to delete
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (content.creator_id !== user.id && profile?.role !== "admin") {
      return NextResponse.json({ error: "Not authorized to delete this content" }, { status: 403 })
    }

    // Delete content (this should cascade to related records)
    const { error: deleteError } = await supabase.from("content").delete().eq("id", contentId)

    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      message: "Content deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting content:", error)
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 })
  }
}
