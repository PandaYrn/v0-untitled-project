import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

// GET: Fetch all genres
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("genres").select("*").order("name")

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching genres:", error)
    return NextResponse.json({ error: "Failed to fetch genres" }, { status: 500 })
  }
}

// POST: Create a new genre (admin only)
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

    // Check if user is an admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: "Genre name is required" }, { status: 400 })
    }

    // Check if genre already exists
    const { data: existingGenre } = await supabase.from("genres").select("id").ilike("name", name).single()

    if (existingGenre) {
      return NextResponse.json({ error: "Genre already exists" }, { status: 400 })
    }

    // Create genre
    const { error } = await supabase.from("genres").insert({
      id: uuidv4(),
      name,
      description,
    })

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Genre created successfully",
    })
  } catch (error) {
    console.error("Error creating genre:", error)
    return NextResponse.json({ error: "Failed to create genre" }, { status: 500 })
  }
}
