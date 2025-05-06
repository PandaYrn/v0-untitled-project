import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

// GET: Fetch content with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") // music, movie, etc.
    const genre = searchParams.get("genre")
    const artist = searchParams.get("artist")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const sort = searchParams.get("sort") || "created_at"
    const order = searchParams.get("order") || "desc"

    const supabase = createServerSupabaseClient()

    let query = supabase.from("content").select(`
      *,
      profiles:creator_id(id, username, full_name, avatar_url),
      genres!inner(*)
    `)

    // Apply filters
    if (type) query = query.eq("content_type", type)
    if (genre) query = query.eq("genres.name", genre)
    if (artist) query = query.eq("creator_id", artist)

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Apply sorting
    query = query.order(sort, { ascending: order === "asc" })

    // Execute query with range
    const { data, error, count } = await query.range(from, to)

    if (error) throw error

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count,
        pages: count ? Math.ceil(count / limit) : 0,
      },
    })
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}

// POST: Create new content
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
    const {
      title,
      description,
      content_type,
      price,
      is_premium,
      genres,
      media_url,
      thumbnail_url,
      duration,
      release_date,
    } = body

    // Validate required fields
    if (!title || !content_type || !media_url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create content record
    const contentId = uuidv4()
    const { error: contentError } = await supabase.from("content").insert({
      id: contentId,
      title,
      description,
      content_type,
      creator_id: user.id,
      price: price || 0,
      is_premium: is_premium || false,
      media_url,
      thumbnail_url,
      duration,
      release_date: release_date || new Date().toISOString(),
    })

    if (contentError) throw contentError

    // Add genres if provided
    if (genres && genres.length > 0) {
      const genreLinks = genres.map((genreId) => ({
        content_id: contentId,
        genre_id: genreId,
      }))

      const { error: genreError } = await supabase.from("content_genres").insert(genreLinks)

      if (genreError) throw genreError
    }

    return NextResponse.json({
      success: true,
      message: "Content created successfully",
      contentId,
    })
  } catch (error) {
    console.error("Error creating content:", error)
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 })
  }
}
