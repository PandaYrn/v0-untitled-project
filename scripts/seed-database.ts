"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export async function seedDatabase() {
  const supabase = createServerSupabaseClient()
  console.log("Starting database seeding process...")

  try {
    // Create sample profiles
    const profiles = [
      {
        id: uuidv4(),
        username: "artist1",
        full_name: "Famous Artist One",
        avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop",
        bio: "Award-winning musician with multiple platinum albums",
        is_artist: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        username: "artist2",
        full_name: "Famous Artist Two",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
        bio: "Innovative filmmaker and music producer",
        is_artist: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        username: "musicfan1",
        full_name: "Music Fan One",
        avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
        bio: "Passionate about discovering new music",
        is_artist: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        username: "moviebuff2",
        full_name: "Movie Buff Two",
        avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
        bio: "Film enthusiast and collector",
        is_artist: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    console.log("Creating profiles...")
    for (const profile of profiles) {
      const { error } = await supabase.from("profiles").upsert(profile, { onConflict: "username" })

      if (error) {
        console.error(`Error creating profile for ${profile.username}:`, error)
      } else {
        console.log(`Created/updated profile: ${profile.username}`)
      }
    }

    // Get the created profiles to use their IDs
    const { data: createdProfiles } = await supabase.from("profiles").select("id, username")
    const profileMap = createdProfiles.reduce((map, profile) => {
      map[profile.username] = profile.id
      return map
    }, {})

    // Create content
    const content = [
      {
        id: uuidv4(),
        title: "Summer Vibes",
        description: "A relaxing summer track with tropical beats",
        creator_id: profileMap["artist1"],
        content_type: "music",
        cover_url: "https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=800&h=800&fit=crop",
        content_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        price: 5.99,
        is_nft: true,
        royalty_percentage: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        title: "Urban Dreams",
        description: "Hip-hop fusion with electronic elements",
        creator_id: profileMap["artist1"],
        content_type: "music",
        cover_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=800&fit=crop",
        content_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        price: 3.99,
        is_nft: false,
        royalty_percentage: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        title: "Lost in Tokyo",
        description: "A short film exploring the streets of Tokyo at night",
        creator_id: profileMap["artist2"],
        content_type: "movie",
        cover_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=450&fit=crop",
        content_url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
        price: 9.99,
        is_nft: true,
        royalty_percentage: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        title: "Acoustic Sessions",
        description: "Live acoustic performances of popular songs",
        creator_id: profileMap["artist2"],
        content_type: "album",
        cover_url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=800&fit=crop",
        content_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        price: 12.99,
        is_nft: false,
        royalty_percentage: 12,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        title: "Tech Talk",
        description: "Weekly podcast discussing the latest in technology",
        creator_id: profileMap["artist1"],
        content_type: "podcast",
        cover_url: "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800&h=800&fit=crop",
        content_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        price: 0,
        is_nft: false,
        royalty_percentage: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        title: "Midnight Jazz",
        description: "Smooth jazz for late night listening",
        creator_id: profileMap["artist1"],
        content_type: "music",
        cover_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=800&fit=crop",
        content_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        price: 4.99,
        is_nft: false,
        royalty_percentage: 7,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        title: "City Lights",
        description: "A documentary about urban life at night",
        creator_id: profileMap["artist2"],
        content_type: "movie",
        cover_url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=450&fit=crop",
        content_url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4",
        price: 7.99,
        is_nft: false,
        royalty_percentage: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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

    // Get the created content to use their IDs
    const { data: createdContent } = await supabase.from("content").select("id, title")
    const contentMap = createdContent.reduce((map, item) => {
      map[item.title] = item.id
      return map
    }, {})

    // Create NFTs
    const nfts = [
      {
        id: uuidv4(),
        content_id: contentMap["Summer Vibes"],
        token_id: "token-1",
        edition_number: 1,
        max_editions: 10,
        owner_id: profileMap["artist1"],
        metadata: {
          attributes: [
            { trait_type: "Genre", value: "Electronic" },
            { trait_type: "BPM", value: 128 },
            { trait_type: "Duration", value: "3:45" },
          ],
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        content_id: contentMap["Lost in Tokyo"],
        token_id: "token-2",
        edition_number: 1,
        max_editions: 5,
        owner_id: profileMap["artist2"],
        metadata: {
          attributes: [
            { trait_type: "Genre", value: "Short Film" },
            { trait_type: "Duration", value: "15:20" },
            { trait_type: "Resolution", value: "4K" },
          ],
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        content_id: contentMap["Summer Vibes"],
        token_id: "token-3",
        edition_number: 2,
        max_editions: 10,
        owner_id: profileMap["musicfan1"],
        metadata: {
          attributes: [
            { trait_type: "Genre", value: "Electronic" },
            { trait_type: "BPM", value: 128 },
            { trait_type: "Duration", value: "3:45" },
          ],
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
        organizer_id: profileMap["artist1"],
        venue: "Central Park, New York",
        event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        cover_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop",
        total_tickets: 1000,
        available_tickets: 1000,
        is_cancelled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        title: "Acoustic Night",
        description: "Intimate acoustic performance",
        organizer_id: profileMap["artist2"],
        venue: "Blue Note Jazz Club, New York",
        event_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        cover_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=450&fit=crop",
        total_tickets: 200,
        available_tickets: 150,
        is_cancelled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        title: "Electronic Music Showcase",
        description: "Featuring the best electronic music artists",
        organizer_id: profileMap["artist1"],
        venue: "Warehouse 23, Brooklyn",
        event_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
        cover_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=450&fit=crop",
        total_tickets: 500,
        available_tickets: 500,
        is_cancelled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
        content_id: contentMap["Summer Vibes"],
        user_id: profileMap["musicfan1"],
        comment: "This is an amazing track! Love the summer vibes.",
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        content_id: contentMap["Summer Vibes"],
        user_id: profileMap["moviebuff2"],
        comment: "Perfect for my summer playlist!",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      },
      {
        id: uuidv4(),
        content_id: contentMap["Lost in Tokyo"],
        user_id: profileMap["musicfan1"],
        comment: "The cinematography is breathtaking.",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      },
      {
        id: uuidv4(),
        content_id: contentMap["Urban Dreams"],
        user_id: profileMap["moviebuff2"],
        comment: "The beat on this track is fire!",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
      {
        id: uuidv4(),
        content_id: contentMap["Acoustic Sessions"],
        user_id: profileMap["musicfan1"],
        comment: "Such a beautiful rendition of these songs.",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
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

    // Create genres
    const genres = [
      {
        id: uuidv4(),
        name: "Pop",
        description: "Popular music with wide appeal",
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Hip Hop",
        description: "Rhythmic music with rapping and beats",
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Rock",
        description: "Guitar-driven music with strong beats",
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Electronic",
        description: "Music produced with electronic instruments and technology",
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Classical",
        description: "Traditional Western music from the 17th to 19th centuries",
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Jazz",
        description: "Complex music with improvisation and swing",
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Documentary",
        description: "Non-fiction films documenting reality",
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Drama",
        description: "Films focused on character development and emotional themes",
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Action",
        description: "Films with exciting sequences and physical stunts",
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Comedy",
        description: "Films intended to make audiences laugh",
        created_at: new Date().toISOString(),
      },
    ]

    console.log("Creating genres...")
    for (const genre of genres) {
      const { error } = await supabase.from("genres").upsert(genre, { onConflict: "name" })

      if (error) {
        console.error(`Error creating genre ${genre.name}:`, error)
      } else {
        console.log(`Created/updated genre: ${genre.name}`)
      }
    }

    // Get the created genres to use their IDs
    const { data: createdGenres } = await supabase.from("genres").select("id, name")
    const genreMap = createdGenres.reduce((map, genre) => {
      map[genre.name] = genre.id
      return map
    }, {})

    // Create content_genres relationships
    const contentGenres = [
      {
        content_id: contentMap["Summer Vibes"],
        genre_id: genreMap["Electronic"],
      },
      {
        content_id: contentMap["Urban Dreams"],
        genre_id: genreMap["Hip Hop"],
      },
      {
        content_id: contentMap["Urban Dreams"],
        genre_id: genreMap["Electronic"],
      },
      {
        content_id: contentMap["Lost in Tokyo"],
        genre_id: genreMap["Documentary"],
      },
      {
        content_id: contentMap["Acoustic Sessions"],
        genre_id: genreMap["Pop"],
      },
      {
        content_id: contentMap["Acoustic Sessions"],
        genre_id: genreMap["Rock"],
      },
      {
        content_id: contentMap["Tech Talk"],
        genre_id: genreMap["Documentary"],
      },
      {
        content_id: contentMap["Midnight Jazz"],
        genre_id: genreMap["Jazz"],
      },
      {
        content_id: contentMap["City Lights"],
        genre_id: genreMap["Documentary"],
      },
      {
        content_id: contentMap["City Lights"],
        genre_id: genreMap["Drama"],
      },
    ]

    console.log("Creating content-genre relationships...")
    for (const contentGenre of contentGenres) {
      const { error } = await supabase.from("content_genres").upsert(contentGenre, {
        onConflict: ["content_id", "genre_id"],
      })

      if (error) {
        console.error(`Error creating content-genre relationship:`, error)
      } else {
        console.log(`Created/updated content-genre relationship`)
      }
    }

    // Create followers relationships
    const followers = [
      {
        follower_id: profileMap["musicfan1"],
        following_id: profileMap["artist1"],
        created_at: new Date().toISOString(),
      },
      {
        follower_id: profileMap["musicfan1"],
        following_id: profileMap["artist2"],
        created_at: new Date().toISOString(),
      },
      {
        follower_id: profileMap["moviebuff2"],
        following_id: profileMap["artist2"],
        created_at: new Date().toISOString(),
      },
    ]

    console.log("Creating follower relationships...")
    for (const follower of followers) {
      const { error } = await supabase.from("followers").upsert(follower, {
        onConflict: ["follower_id", "following_id"],
      })

      if (error) {
        console.error(`Error creating follower relationship:`, error)
      } else {
        console.log(`Created/updated follower relationship`)
      }
    }

    // Create playlists
    const playlists = [
      {
        id: uuidv4(),
        name: "Summer Hits",
        description: "Perfect playlist for summer days",
        user_id: profileMap["musicfan1"],
        is_public: true,
        cover_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=800&fit=crop",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Chill Vibes",
        description: "Relaxing music for unwinding",
        user_id: profileMap["moviebuff2"],
        is_public: true,
        cover_url: "https://images.unsplash.com/photo-1520262454473-a1a82276a574?w=800&h=800&fit=crop",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "My Favorites",
        description: "A collection of my favorite tracks",
        user_id: profileMap["musicfan1"],
        is_public: false,
        cover_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=800&fit=crop",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    console.log("Creating playlists...")
    for (const playlist of playlists) {
      const { error } = await supabase.from("playlists").upsert(playlist, { onConflict: "id" })

      if (error) {
        console.error(`Error creating playlist ${playlist.name}:`, error)
      } else {
        console.log(`Created/updated playlist: ${playlist.name}`)
      }
    }

    // Get the created playlists to use their IDs
    const { data: createdPlaylists } = await supabase.from("playlists").select("id, name")
    const playlistMap = createdPlaylists.reduce((map, playlist) => {
      map[playlist.name] = playlist.id
      return map
    }, {})

    // Create playlist items
    const playlistItems = [
      {
        id: uuidv4(),
        playlist_id: playlistMap["Summer Hits"],
        content_id: contentMap["Summer Vibes"],
        position: 1,
        added_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        playlist_id: playlistMap["Summer Hits"],
        content_id: contentMap["Urban Dreams"],
        position: 2,
        added_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        playlist_id: playlistMap["Chill Vibes"],
        content_id: contentMap["Midnight Jazz"],
        position: 1,
        added_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        playlist_id: playlistMap["Chill Vibes"],
        content_id: contentMap["Acoustic Sessions"],
        position: 2,
        added_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        playlist_id: playlistMap["My Favorites"],
        content_id: contentMap["Summer Vibes"],
        position: 1,
        added_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        playlist_id: playlistMap["My Favorites"],
        content_id: contentMap["Midnight Jazz"],
        position: 2,
        added_at: new Date().toISOString(),
      },
    ]

    console.log("Creating playlist items...")
    for (const item of playlistItems) {
      const { error } = await supabase.from("playlist_items").upsert(item, { onConflict: "id" })

      if (error) {
        console.error(`Error creating playlist item:`, error)
      } else {
        console.log(`Created/updated playlist item`)
      }
    }

    // Create purchases
    const purchases = [
      {
        id: uuidv4(),
        user_id: profileMap["musicfan1"],
        content_id: contentMap["Summer Vibes"],
        transaction_hash:
          "0x" +
          Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join(""),
        amount: 5.99,
        purchased_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      },
      {
        id: uuidv4(),
        user_id: profileMap["moviebuff2"],
        content_id: contentMap["Lost in Tokyo"],
        transaction_hash:
          "0x" +
          Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join(""),
        amount: 9.99,
        purchased_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      },
      {
        id: uuidv4(),
        user_id: profileMap["musicfan1"],
        content_id: contentMap["Acoustic Sessions"],
        transaction_hash:
          "0x" +
          Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join(""),
        amount: 12.99,
        purchased_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      },
    ]

    console.log("Creating purchases...")
    for (const purchase of purchases) {
      const { error } = await supabase.from("purchases").upsert(purchase, { onConflict: "id" })

      if (error) {
        console.error(`Error creating purchase:`, error)
      } else {
        console.log(`Created/updated purchase`)
      }
    }

    // Create blockchain transactions
    const blockchainTransactions = [
      {
        id: uuidv4(),
        user_id: profileMap["musicfan1"],
        transaction_hash:
          "0x" +
          Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join(""),
        transaction_type: "purchase",
        status: "completed",
        metadata: {
          content_id: contentMap["Summer Vibes"],
          amount: 5.99,
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        },
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      },
      {
        id: uuidv4(),
        user_id: profileMap["moviebuff2"],
        transaction_hash:
          "0x" +
          Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join(""),
        transaction_type: "nft_mint",
        status: "completed",
        metadata: {
          content_id: contentMap["Lost in Tokyo"],
          token_id: "token-2",
          amount: 9.99,
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        },
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      },
      {
        id: uuidv4(),
        user_id: profileMap["musicfan1"],
        transaction_hash:
          "0x" +
          Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join(""),
        transaction_type: "royalty_payment",
        status: "completed",
        metadata: {
          content_id: contentMap["Summer Vibes"],
          amount: 0.59,
          recipient_id: profileMap["artist1"],
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      },
    ]

    console.log("Creating blockchain transactions...")
    for (const transaction of blockchainTransactions) {
      const { error } = await supabase.from("blockchain_transactions").upsert(transaction, { onConflict: "id" })

      if (error) {
        console.error(`Error creating blockchain transaction:`, error)
      } else {
        console.log(`Created/updated blockchain transaction`)
      }
    }

    // Create royalty payments
    const royaltyPayments = [
      {
        id: uuidv4(),
        content_id: contentMap["Summer Vibes"],
        recipient_id: profileMap["artist1"],
        amount: 0.59,
        transaction_hash:
          "0x" +
          Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join(""),
        payment_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      },
      {
        id: uuidv4(),
        content_id: contentMap["Lost in Tokyo"],
        recipient_id: profileMap["artist2"],
        amount: 1.49,
        transaction_hash:
          "0x" +
          Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join(""),
        payment_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
    ]

    console.log("Creating royalty payments...")
    for (const payment of royaltyPayments) {
      const { error } = await supabase.from("royalty_payments").upsert(payment, { onConflict: "id" })

      if (error) {
        console.error(`Error creating royalty payment:`, error)
      } else {
        console.log(`Created/updated royalty payment`)
      }
    }

    return {
      success: true,
      message: "Database seeded successfully",
      stats: {
        profiles: profiles.length,
        content: content.length,
        nfts: nfts.length,
        events: events.length,
        comments: comments.length,
        genres: genres.length,
        contentGenres: contentGenres.length,
        followers: followers.length,
        playlists: playlists.length,
        playlistItems: playlistItems.length,
        purchases: purchases.length,
        blockchainTransactions: blockchainTransactions.length,
        royaltyPayments: royaltyPayments.length,
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
