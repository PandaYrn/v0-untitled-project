"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export async function seedDatabase() {
  const supabase = createServerSupabaseClient()
  console.log("Starting database seeding process...")

  try {
    // Create sample users
    const users = [
      {
        id: "user-1",
        email: "artist1@example.com",
        password: "password123",
      },
      {
        id: "user-2",
        email: "artist2@example.com",
        password: "password123",
      },
      {
        id: "user-3",
        email: "fan1@example.com",
        password: "password123",
      },
      {
        id: "user-4",
        email: "fan2@example.com",
        password: "password123",
      },
    ]

    console.log("Creating sample users...")
    for (const user of users) {
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      })

      if (!existingUser.user) {
        const { error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              id: user.id,
            },
          },
        })

        if (error) {
          console.error(`Error creating user ${user.email}:`, error)
        } else {
          console.log(`Created user: ${user.email}`)
        }
      } else {
        console.log(`User already exists: ${user.email}`)
      }
    }

    // Create profiles
    const profiles = [
      {
        id: "user-1",
        username: "artist1",
        full_name: "Famous Artist One",
        bio: "Award-winning musician with multiple platinum albums",
        is_artist: true,
      },
      {
        id: "user-2",
        username: "artist2",
        full_name: "Famous Artist Two",
        bio: "Innovative filmmaker and music producer",
        is_artist: true,
      },
      {
        id: "user-3",
        username: "musicfan1",
        full_name: "Music Fan One",
        bio: "Passionate about discovering new music",
        is_artist: false,
      },
      {
        id: "user-4",
        username: "moviebuff2",
        full_name: "Movie Buff Two",
        bio: "Film enthusiast and collector",
        is_artist: false,
      },
    ]

    console.log("Creating profiles...")
    for (const profile of profiles) {
      const { error } = await supabase.from("profiles").upsert(profile, { onConflict: "id" })

      if (error) {
        console.error(`Error creating profile for ${profile.username}:`, error)
      } else {
        console.log(`Created/updated profile: ${profile.username}`)
      }
    }

    // Create content
    const content = [
      {
        id: "content-1",
        title: "Summer Vibes",
        description: "A relaxing summer track with tropical beats",
        creator_id: "user-1",
        content_type: "music",
        cover_url: "https://images.unsplash.com/photo-1530968033775-2c92736b131e",
        price: 5.99,
        is_nft: true,
        royalty_percentage: 10,
      },
      {
        id: "content-2",
        title: "Urban Dreams",
        description: "Hip-hop fusion with electronic elements",
        creator_id: "user-1",
        content_type: "music",
        cover_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
        price: 3.99,
        is_nft: false,
        royalty_percentage: 8,
      },
      {
        id: "content-3",
        title: "Lost in Tokyo",
        description: "A short film exploring the streets of Tokyo at night",
        creator_id: "user-2",
        content_type: "movie",
        cover_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
        price: 9.99,
        is_nft: true,
        royalty_percentage: 15,
      },
      {
        id: "content-4",
        title: "Acoustic Sessions",
        description: "Live acoustic performances of popular songs",
        creator_id: "user-2",
        content_type: "album",
        cover_url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
        price: 12.99,
        is_nft: false,
        royalty_percentage: 12,
      },
      {
        id: "content-5",
        title: "Tech Talk",
        description: "Weekly podcast discussing the latest in technology",
        creator_id: "user-1",
        content_type: "podcast",
        cover_url: "https://images.unsplash.com/photo-1589903308904-1010c2294adc",
        price: 0,
        is_nft: false,
        royalty_percentage: 5,
      },
    ]

    console.log("Creating content...")
    for (const item of content) {
      const { error } = await supabase.from("content").upsert(item, { onConflict: "id" })

      if (error) {
        console.error(`Error creating content ${item.title}:`, error)
      } else {
        console.log(`Created/updated content: ${item.title}`)
      }
    }

    // Create NFTs
    const nfts = [
      {
        id: uuidv4(),
        content_id: "content-1",
        token_id: "token-1",
        edition_number: 1,
        max_editions: 10,
        owner_id: "user-1",
        metadata: {
          attributes: [
            { trait_type: "Genre", value: "Electronic" },
            { trait_type: "BPM", value: 128 },
            { trait_type: "Duration", value: "3:45" },
          ],
        },
      },
      {
        id: uuidv4(),
        content_id: "content-3",
        token_id: "token-2",
        edition_number: 1,
        max_editions: 5,
        owner_id: "user-2",
        metadata: {
          attributes: [
            { trait_type: "Genre", value: "Short Film" },
            { trait_type: "Duration", value: "15:20" },
            { trait_type: "Resolution", value: "4K" },
          ],
        },
      },
    ]

    console.log("Creating NFTs...")
    for (const nft of nfts) {
      const { error } = await supabase.from("nfts").upsert(nft, { onConflict: "id" })

      if (error) {
        console.error(`Error creating NFT for content ${nft.content_id}:`, error)
      } else {
        console.log(`Created/updated NFT for content: ${nft.content_id}`)
      }
    }

    // Create events
    const events = [
      {
        id: uuidv4(),
        title: "Summer Music Festival",
        description: "Annual music festival featuring top artists",
        organizer_id: "user-1",
        venue: "Central Park, New York",
        event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        cover_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
        total_tickets: 1000,
        available_tickets: 1000,
        is_cancelled: false,
      },
      {
        id: uuidv4(),
        title: "Acoustic Night",
        description: "Intimate acoustic performance",
        organizer_id: "user-2",
        venue: "Blue Note Jazz Club, New York",
        event_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        cover_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
        total_tickets: 200,
        available_tickets: 150,
        is_cancelled: false,
      },
    ]

    console.log("Creating events...")
    for (const event of events) {
      const { error } = await supabase.from("events").upsert(event, { onConflict: "id" })

      if (error) {
        console.error(`Error creating event ${event.title}:`, error)
      } else {
        console.log(`Created/updated event: ${event.title}`)
      }
    }

    // Create comments
    const comments = [
      {
        id: uuidv4(),
        content_id: "content-1",
        user_id: "user-3",
        comment: "This is an amazing track! Love the summer vibes.",
      },
      {
        id: uuidv4(),
        content_id: "content-1",
        user_id: "user-4",
        comment: "Perfect for my summer playlist!",
      },
      {
        id: uuidv4(),
        content_id: "content-3",
        user_id: "user-3",
        comment: "The cinematography is breathtaking.",
      },
    ]

    console.log("Creating comments...")
    for (const comment of comments) {
      const { error } = await supabase.from("comments").upsert(comment, { onConflict: "id" })

      if (error) {
        console.error(`Error creating comment for content ${comment.content_id}:`, error)
      } else {
        console.log(`Created/updated comment for content: ${comment.content_id}`)
      }
    }

    // Create blockchain transactions
    const transactions = [
      {
        id: uuidv4(),
        user_id: "user-3",
        transaction_hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        transaction_type: "purchase",
        status: "completed",
        metadata: {
          content_id: "content-1",
          amount: 5.99,
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: uuidv4(),
        user_id: "user-4",
        transaction_hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        transaction_type: "nft_mint",
        status: "completed",
        metadata: {
          content_id: "content-3",
          token_id: "token-2",
          amount: 9.99,
          timestamp: new Date().toISOString(),
        },
      },
    ]

    console.log("Creating blockchain transactions...")
    for (const transaction of transactions) {
      const { error } = await supabase.from("blockchain_transactions").upsert(transaction, { onConflict: "id" })

      if (error) {
        console.error(`Error creating transaction for user ${transaction.user_id}:`, error)
      } else {
        console.log(`Created/updated transaction for user: ${transaction.user_id}`)
      }
    }

    return {
      success: true,
      message: "Database seeded successfully",
      stats: {
        users: users.length,
        profiles: profiles.length,
        content: content.length,
        nfts: nfts.length,
        events: events.length,
        comments: comments.length,
        transactions: transactions.length,
      },
    }
  } catch (error) {
    console.error("Error seeding database:", error)
    return {
      success: false,
      error: "Failed to seed database",
      details: error.message,
    }
  }
}
