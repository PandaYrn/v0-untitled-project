import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

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

    // Get recent purchases
    const { data: purchasesData, error: purchasesError } = await supabase
      .from("purchases")
      .select(`
        *,
        content:content_id(title, content_type, thumbnail_url, creator_id),
        content_creator:content(profiles:creator_id(username, avatar_url))
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (purchasesError) throw purchasesError

    // Get owned NFTs
    const { data: nftsData, error: nftsError } = await supabase
      .from("nfts")
      .select(`
        *,
        content:content_id(title, content_type, thumbnail_url, creator_id),
        content_creator:content(profiles:creator_id(username, avatar_url))
      `)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })

    if (nftsError) throw nftsError

    // Get upcoming tickets
    const { data: ticketsData, error: ticketsError } = await supabase
      .from("tickets")
      .select(`
        *,
        event:event_id(title, event_type, event_date, location, venue, image_url, creator_id),
        event_creator:event(profiles:creator_id(username, avatar_url))
      `)
      .eq("user_id", user.id)
      .gt("event:events.event_date", new Date().toISOString())
      .order("event:events.event_date", { ascending: true })

    if (ticketsError) throw ticketsError

    // Get recently played content
    const { data: recentlyPlayedData, error: recentlyPlayedError } = await supabase
      .from("streaming_sessions")
      .select(`
        *,
        content:content_id(title, content_type, thumbnail_url, creator_id),
        content_creator:content(profiles:creator_id(username, avatar_url))
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentlyPlayedError) throw recentlyPlayedError

    // Get followed artists
    const { data: followedArtistsData, error: followedArtistsError } = await supabase
      .from("user_followers")
      .select(`
        profiles:user_id(id, username, full_name, avatar_url)
      `)
      .eq("follower_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (followedArtistsError) throw followedArtistsError

    return NextResponse.json({
      recentPurchases: purchasesData,
      ownedNFTs: nftsData,
      upcomingTickets: ticketsData,
      recentlyPlayed: recentlyPlayedData,
      followedArtists: followedArtistsData?.map((item) => item.profiles),
    })
  } catch (error) {
    console.error("Error fetching user dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
