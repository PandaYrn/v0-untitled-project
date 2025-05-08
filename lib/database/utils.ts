"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { executeQuery } from "@/lib/neon/client"

// Function to get content with creator information
export async function getContentWithCreator(contentId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("content")
    .select(`
      *,
      creator:profiles(id, username, full_name, avatar_url)
    `)
    .eq("id", contentId)
    .single()

  if (error) {
    console.error("Error fetching content:", error)
    return null
  }

  return data
}

// Function to get featured content
export async function getFeaturedContent(limit = 6) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("content")
    .select(`
      *,
      creator:profiles(id, username, full_name, avatar_url)
    `)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching featured content:", error)
    return []
  }

  return data
}

// Function to get content by type
export async function getContentByType(type: string, limit = 10) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("content")
    .select(`
      *,
      creator:profiles(id, username, full_name, avatar_url)
    `)
    .eq("content_type", type)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error(`Error fetching ${type} content:`, error)
    return []
  }

  return data
}

// Function to get user profile
export async function getUserProfile(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data
}

// Function to get user content
export async function getUserContent(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user content:", error)
    return []
  }

  return data
}

// Function to get user purchases
export async function getUserPurchases(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("purchases")
    .select(`
      *,
      content(*)
    `)
    .eq("user_id", userId)
    .order("purchased_at", { ascending: false })

  if (error) {
    console.error("Error fetching user purchases:", error)
    return []
  }

  return data
}

// Function to get user NFTs
export async function getUserNFTs(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("nfts")
    .select(`
      *,
      content(*)
    `)
    .eq("owner_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user NFTs:", error)
    return []
  }

  return data
}

// Function to get content comments
export async function getContentComments(contentId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      user:profiles(id, username, full_name, avatar_url)
    `)
    .eq("content_id", contentId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching content comments:", error)
    return []
  }

  return data
}

// Function to add a comment
export async function addComment(contentId: string, userId: string, comment: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("comments")
    .insert({
      content_id: contentId,
      user_id: userId,
      comment,
    })
    .select()

  if (error) {
    console.error("Error adding comment:", error)
    return null
  }

  return data[0]
}

// Function to get upcoming events
export async function getUpcomingEvents(limit = 5) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      organizer:profiles(id, username, full_name, avatar_url)
    `)
    .gt("event_date", new Date().toISOString())
    .eq("is_cancelled", false)
    .order("event_date", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("Error fetching upcoming events:", error)
    return []
  }

  return data
}

// Function to get event details
export async function getEventDetails(eventId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      organizer:profiles(id, username, full_name, avatar_url)
    `)
    .eq("id", eventId)
    .single()

  if (error) {
    console.error("Error fetching event details:", error)
    return null
  }

  return data
}

// Function to purchase a ticket
export async function purchaseTicket(eventId: string, userId: string, price: number, transactionId: string) {
  const supabase = createServerSupabaseClient()

  // Start a transaction to update available tickets and create a ticket
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("available_tickets")
    .eq("id", eventId)
    .single()

  if (eventError || !event) {
    console.error("Error fetching event:", eventError)
    return { success: false, error: "Event not found" }
  }

  if (event.available_tickets <= 0) {
    return { success: false, error: "No tickets available" }
  }

  // Update available tickets
  const { error: updateError } = await supabase
    .from("events")
    .update({ available_tickets: event.available_tickets - 1 })
    .eq("id", eventId)

  if (updateError) {
    console.error("Error updating available tickets:", updateError)
    return { success: false, error: "Failed to update available tickets" }
  }

  // Create ticket
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .insert({
      event_id: eventId,
      user_id: userId,
      price,
      transaction_id: transactionId,
      status: "active",
    })
    .select()

  if (ticketError) {
    console.error("Error creating ticket:", ticketError)
    return { success: false, error: "Failed to create ticket" }
  }

  return { success: true, ticket: ticket[0] }
}

// Function to track content view using the analytics schema
export async function trackContentView(data: {
  contentId: string
  userId?: string
  sessionId: string
  viewDuration?: number
  platform?: string
  country?: string
  referrer?: string
}) {
  try {
    const query = `
      INSERT INTO analytics.content_views 
      (content_id, user_id, session_id, view_duration, platform, country, referrer, view_timestamp)
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id
    `

    const params = [
      data.contentId,
      data.userId || null,
      data.sessionId,
      data.viewDuration || 0,
      data.platform || "web",
      data.country || null,
      data.referrer || null,
    ]

    const result = await executeQuery(query, params)
    return { success: true, id: result[0].id }
  } catch (error) {
    console.error("Error tracking content view:", error)
    return { success: false, error: "Failed to track content view" }
  }
}

// Function to track user engagement using the analytics schema
export async function trackEngagement(data: {
  userId: string
  eventType: string
  contentId?: string
  metadata?: any
}) {
  try {
    const query = `
      INSERT INTO analytics.user_engagement 
      (user_id, event_type, content_id, metadata, event_timestamp)
      VALUES 
      ($1, $2, $3, $4, NOW())
      RETURNING id
    `

    const params = [
      data.userId,
      data.eventType,
      data.contentId || null,
      data.metadata ? JSON.stringify(data.metadata) : null,
    ]

    const result = await executeQuery(query, params)
    return { success: true, id: result[0].id }
  } catch (error) {
    console.error("Error tracking engagement:", error)
    return { success: false, error: "Failed to track engagement" }
  }
}

// Function to track transactions using the analytics schema
export async function trackTransaction(data: {
  transactionId: string
  userId: string
  contentId?: string
  eventId?: string
  transactionType: string
  amount: number
  currency: string
  platformFee: number
  creatorRevenue: number
  paymentMethod?: string
  transactionStatus: string
}) {
  try {
    const query = `
      INSERT INTO analytics.transactions 
      (transaction_id, user_id, content_id, event_id, transaction_type, 
       amount, currency, platform_fee, creator_revenue, payment_method, 
       transaction_status, transaction_timestamp)
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING id
    `

    const params = [
      data.transactionId,
      data.userId,
      data.contentId || null,
      data.eventId || null,
      data.transactionType,
      data.amount,
      data.currency,
      data.platformFee,
      data.creatorRevenue,
      data.paymentMethod || null,
      data.transactionStatus,
    ]

    const result = await executeQuery(query, params)
    return { success: true, id: result[0].id }
  } catch (error) {
    console.error("Error tracking transaction:", error)
    return { success: false, error: "Failed to track transaction" }
  }
}
