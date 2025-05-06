"use server"

import { executeQuery } from "@/lib/neon/client"
import { v4 as uuidv4 } from "uuid"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function seedAnalyticsData() {
  try {
    const supabase = createServerSupabaseClient()

    // Fetch content IDs
    const { data: contentData } = await supabase.from("content").select("id, content_type").limit(10)

    if (!contentData || contentData.length === 0) {
      throw new Error("No content found to seed analytics data")
    }

    // Fetch user IDs
    const { data: userData } = await supabase.from("profiles").select("id").limit(10)

    if (!userData || userData.length === 0) {
      throw new Error("No users found to seed analytics data")
    }

    const contentIds = contentData.map((c) => c.id)
    const userIds = userData.map((u) => u.id)

    // Generate random dates within the last 30 days
    const getRandomDate = () => {
      const now = new Date()
      const daysAgo = Math.floor(Math.random() * 30)
      now.setDate(now.getDate() - daysAgo)
      return now.toISOString()
    }

    // Generate random view durations (5 seconds to 10 minutes)
    const getRandomDuration = () => Math.floor(Math.random() * 595) + 5

    // Generate random amount (0.1 to 50 SUI)
    const getRandomAmount = () => (Math.random() * 49.9 + 0.1).toFixed(2)

    // Seed content views
    const viewsPromises = []
    for (let i = 0; i < 1000; i++) {
      const contentId = contentIds[Math.floor(Math.random() * contentIds.length)]
      const userId = Math.random() > 0.3 ? userIds[Math.floor(Math.random() * userIds.length)] : null
      const sessionId = uuidv4()
      const viewDuration = getRandomDuration()
      const platform = Math.random() > 0.7 ? "mobile" : "web"
      const country = ["US", "UK", "CA", "AU", "DE", "FR", "JP", "BR", "IN", "NG"][Math.floor(Math.random() * 10)]
      const referrer =
        Math.random() > 0.6
          ? ["google.com", "twitter.com", "facebook.com", "instagram.com", "youtube.com"][Math.floor(Math.random() * 5)]
          : null

      const query = `
        INSERT INTO analytics.content_views 
        (content_id, user_id, session_id, view_duration, platform, country, referrer, view_timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `

      viewsPromises.push(
        executeQuery(query, [contentId, userId, sessionId, viewDuration, platform, country, referrer, getRandomDate()]),
      )
    }

    // Seed user engagement
    const engagementPromises = []
    const eventTypes = ["like", "share", "comment", "search", "playlist_add", "follow", "download"]

    for (let i = 0; i < 500; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)]
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
      const contentId = Math.random() > 0.3 ? contentIds[Math.floor(Math.random() * contentIds.length)] : null
      const metadata = Math.random() > 0.5 ? { source: "web", device: "desktop" } : null

      const query = `
        INSERT INTO analytics.user_engagement 
        (user_id, event_type, content_id, metadata, event_timestamp)
        VALUES ($1, $2, $3, $4, $5)
      `

      engagementPromises.push(
        executeQuery(query, [
          userId,
          eventType,
          contentId,
          metadata ? JSON.stringify(metadata) : null,
          getRandomDate(),
        ]),
      )
    }

    // Seed transactions
    const transactionPromises = []
    const transactionTypes = ["purchase", "royalty", "ticket", "nft", "subscription"]

    for (let i = 0; i < 200; i++) {
      const transactionId = uuidv4()
      const userId = userIds[Math.floor(Math.random() * userIds.length)]
      const contentId = Math.random() > 0.4 ? contentIds[Math.floor(Math.random() * contentIds.length)] : null
      const eventId = Math.random() > 0.7 ? uuidv4() : null
      const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
      const amount = getRandomAmount()
      const platformFee = (Number.parseFloat(amount) * 0.05).toFixed(2)
      const creatorRevenue = (Number.parseFloat(amount) * 0.95).toFixed(2)
      const paymentMethod = ["wallet", "credit_card", "crypto"][Math.floor(Math.random() * 3)]

      const query = `
        INSERT INTO analytics.transactions 
        (transaction_id, user_id, content_id, event_id, transaction_type, 
         amount, platform_fee, creator_revenue, payment_method, transaction_timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `

      transactionPromises.push(
        executeQuery(query, [
          transactionId,
          userId,
          contentId,
          eventId,
          transactionType,
          amount,
          platformFee,
          creatorRevenue,
          paymentMethod,
          getRandomDate(),
        ]),
      )
    }

    // Execute all promises
    await Promise.all([...viewsPromises, ...engagementPromises, ...transactionPromises])

    return { success: true, message: "Analytics data seeded successfully" }
  } catch (error) {
    console.error("Error seeding analytics data:", error)
    return { success: false, error: error.message }
  }
}
