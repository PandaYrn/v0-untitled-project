import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// GET: Fetch a single event by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id
    const supabase = createServerSupabaseClient()

    // Fetch event with related data
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        profiles:creator_id(id, username, full_name, avatar_url),
        tickets_count:tickets(count),
        content:content_id(id, title, content_type, thumbnail_url)
      `)
      .eq("id", eventId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }
      throw error
    }

    // Check if current user has a ticket
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let hasTicket = false
    if (user) {
      const { data: ticketData } = await supabase
        .from("tickets")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single()

      hasTicket = !!ticketData
    }

    return NextResponse.json({
      ...data,
      hasTicket,
    })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

// PATCH: Update an event
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id
    const supabase = createServerSupabaseClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is the event creator or an admin
    const { data: event } = await supabase.from("events").select("creator_id").eq("id", eventId).single()

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if user is authorized to update
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (event.creator_id !== user.id && profile?.role !== "admin") {
      return NextResponse.json({ error: "Not authorized to update this event" }, { status: 403 })
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
      status,
    } = body

    // Update event
    const { error: updateError } = await supabase
      .from("events")
      .update({
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
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
    })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

// DELETE: Cancel an event
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id
    const supabase = createServerSupabaseClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is the event creator or an admin
    const { data: event } = await supabase.from("events").select("creator_id").eq("id", eventId).single()

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if user is authorized to cancel
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (event.creator_id !== user.id && profile?.role !== "admin") {
      return NextResponse.json({ error: "Not authorized to cancel this event" }, { status: 403 })
    }

    // Update event status to cancelled
    const { error: updateError } = await supabase
      .from("events")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: "Event cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling event:", error)
    return NextResponse.json({ error: "Failed to cancel event" }, { status: 500 })
  }
}
