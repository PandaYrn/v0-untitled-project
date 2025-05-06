import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

// GET: Fetch events with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const artistId = searchParams.get("artistId")
    const type = searchParams.get("type") // concert, meet_greet, etc.
    const upcoming = searchParams.get("upcoming") === "true"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const supabase = createServerSupabaseClient()

    let query = supabase.from("events").select(`
      *,
      profiles:creator_id(id, username, full_name, avatar_url),
      tickets_count:tickets(count)
    `)

    // Apply filters
    if (artistId) query = query.eq("creator_id", artistId)
    if (type) query = query.eq("event_type", type)
    if (upcoming) query = query.gt("event_date", new Date().toISOString())

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Apply sorting (upcoming events first)
    query = query.order("event_date", { ascending: true })

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
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

// POST: Create a new event
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

    // Check if user is an artist
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "artist" && profile?.role !== "admin") {
      return NextResponse.json({ error: "Only artists can create events" }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      event_type,
      event_date,
      location,
      venue,
      max_tickets,
      ticket_price,
      content_id,
      image_url,
    } = body

    // Validate required fields
    if (!title || !event_type || !event_date || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create event
    const eventId = uuidv4()
    const { error: eventError } = await supabase.from("events").insert({
      id: eventId,
      title,
      description,
      event_type,
      event_date,
      location,
      venue,
      max_tickets: max_tickets || null,
      ticket_price: ticket_price || 0,
      creator_id: user.id,
      content_id,
      image_url,
    })

    if (eventError) throw eventError

    return NextResponse.json({
      success: true,
      message: "Event created successfully",
      eventId,
    })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
