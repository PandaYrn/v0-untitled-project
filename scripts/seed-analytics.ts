"use server"

import { executeQuery } from "@/lib/neon/client"

// Helper function to generate a random date within the last 30 days
function getRandomDate() {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 30)
  now.setDate(now.getDate() - daysAgo)
  return now.toISOString()
}

// Helper function to get a random item from an array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)]
}

// Helper function to generate a random number between min and max
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Helper function to generate a random decimal between min and max with 2 decimal places
function getRandomDecimal(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2)
}

/**
 * Seed the analytics database with sample data
 */
export async function seedAnalyticsData() {
  try {
    console.log("Starting analytics data seeding process...")

    // Create schema if it doesn't exist
    await executeQuery("CREATE SCHEMA IF NOT EXISTS analytics")

    // Create tables if they don't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS analytics.content_views (
        id SERIAL PRIMARY KEY,
        content_id TEXT NOT NULL,
        user_id TEXT,
        session_id TEXT,
        view_duration INTEGER,
        platform TEXT,
        country TEXT,
        referrer TEXT,
        view_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS analytics.user_engagement (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        content_id TEXT,
        metadata JSONB,
        event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS analytics.transactions (
        id SERIAL PRIMARY KEY,
        transaction_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        content_id TEXT,
        event_id TEXT,
        transaction_type TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        platform_fee DECIMAL(10, 2),
        creator_revenue DECIMAL(10, 2),
        payment_method TEXT,
        transaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Clear existing data
    await executeQuery("TRUNCATE analytics.content_views CASCADE")
    await executeQuery("TRUNCATE analytics.user_engagement CASCADE")
    await executeQuery("TRUNCATE analytics.transactions CASCADE")

    console.log("Tables created and cleared successfully")

    // Sample data arrays
    const contentIds = [
      "content-1",
      "content-2",
      "content-3",
      "content-4",
      "content-5",
      "content-6",
      "content-7",
      "content-8",
      "content-9",
      "content-10",
    ]

    const userIds = [
      "user-1",
      "user-2",
      "user-3",
      "user-4",
      "user-5",
      "user-6",
      "user-7",
      "user-8",
      "user-9",
      "user-10",
    ]

    const platforms = ["web", "mobile", "desktop", "tv", "console"]
    const countries = ["US", "UK", "CA", "AU", "DE", "FR", "JP", "BR", "IN", "NG"]
    const referrers = ["google", "twitter", "facebook", "instagram", "youtube", "direct", null]

    const eventTypes = [
      "like",
      "share",
      "comment",
      "search",
      "playlist_add",
      "follow",
      "download",
      "subscribe",
      "rate",
      "bookmark",
    ]

    const transactionTypes = [
      "purchase",
      "royalty",
      "ticket",
      "nft",
      "subscription",
      "rental",
      "tip",
      "merchandise",
      "album",
      "single",
    ]

    const paymentMethods = ["wallet", "credit_card", "crypto", "paypal", "bank_transfer"]

    // Generate content views
    console.log("Generating content views...")
    const viewsPromises = []

    for (let i = 0; i < 1000; i++) {
      const contentId = getRandomItem(contentIds)
      const userId = Math.random() > 0.3 ? getRandomItem(userIds) : null
      const sessionId = `session-${getRandomNumber(1000, 9999)}`
      const viewDuration = getRandomNumber(5, 3600)
      const platform = getRandomItem(platforms)
      const country = getRandomItem(countries)
      const referrer = getRandomItem(referrers)
      const viewTimestamp = getRandomDate()

      const query = `
        INSERT INTO analytics.content_views 
        (content_id, user_id, session_id, view_duration, platform, country, referrer, view_timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `

      viewsPromises.push(
        executeQuery(query, [contentId, userId, sessionId, viewDuration, platform, country, referrer, viewTimestamp]),
      )
    }

    await Promise.all(viewsPromises)
    console.log("Content views generated successfully")

    // Generate user engagement
    console.log("Generating user engagement...")
    const engagementPromises = []

    for (let i = 0; i < 500; i++) {
      const userId = getRandomItem(userIds)
      const eventType = getRandomItem(eventTypes)
      const contentId = Math.random() > 0.2 ? getRandomItem(contentIds) : null
      const metadata =
        Math.random() > 0.5
          ? JSON.stringify({
              source: getRandomItem(platforms),
              duration: getRandomNumber(1, 300),
            })
          : null
      const eventTimestamp = getRandomDate()

      const query = `
        INSERT INTO analytics.user_engagement 
        (user_id, event_type, content_id, metadata, event_timestamp)
        VALUES ($1, $2, $3, $4, $5)
      `

      engagementPromises.push(executeQuery(query, [userId, eventType, contentId, metadata, eventTimestamp]))
    }

    await Promise.all(engagementPromises)
    console.log("User engagement generated successfully")

    // Generate transactions
    console.log("Generating transactions...")
    const transactionPromises = []

    for (let i = 0; i < 200; i++) {
      const transactionId = `txn-${getRandomNumber(10000, 99999)}`
      const userId = getRandomItem(userIds)
      const contentId = Math.random() > 0.3 ? getRandomItem(contentIds) : null
      const eventId = Math.random() > 0.7 ? `event-${getRandomNumber(1000, 9999)}` : null
      const transactionType = getRandomItem(transactionTypes)
      const amount = getRandomDecimal(0.99, 99.99)
      const platformFee = (Number.parseFloat(amount) * 0.05).toFixed(2)
      const creatorRevenue = (Number.parseFloat(amount) * 0.95).toFixed(2)
      const paymentMethod = getRandomItem(paymentMethods)
      const transactionTimestamp = getRandomDate()

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
          transactionTimestamp,
        ]),
      )
    }

    await Promise.all(transactionPromises)
    console.log("Transactions generated successfully")

    // Create indexes for better performance
    console.log("Creating indexes...")

    await executeQuery("CREATE INDEX IF NOT EXISTS idx_content_views_content_id ON analytics.content_views(content_id)")
    await executeQuery("CREATE INDEX IF NOT EXISTS idx_content_views_user_id ON analytics.content_views(user_id)")
    await executeQuery(
      "CREATE INDEX IF NOT EXISTS idx_content_views_timestamp ON analytics.content_views(view_timestamp)",
    )

    await executeQuery("CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON analytics.user_engagement(user_id)")
    await executeQuery(
      "CREATE INDEX IF NOT EXISTS idx_user_engagement_content_id ON analytics.user_engagement(content_id)",
    )
    await executeQuery(
      "CREATE INDEX IF NOT EXISTS idx_user_engagement_event_type ON analytics.user_engagement(event_type)",
    )
    await executeQuery(
      "CREATE INDEX IF NOT EXISTS idx_user_engagement_timestamp ON analytics.user_engagement(event_timestamp)",
    )

    await executeQuery("CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON analytics.transactions(user_id)")
    await executeQuery("CREATE INDEX IF NOT EXISTS idx_transactions_content_id ON analytics.transactions(content_id)")
    await executeQuery("CREATE INDEX IF NOT EXISTS idx_transactions_type ON analytics.transactions(transaction_type)")
    await executeQuery(
      "CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON analytics.transactions(transaction_timestamp)",
    )

    console.log("Indexes created successfully")

    return {
      success: true,
      message: "Analytics data seeded successfully",
      stats: {
        views: 1000,
        engagements: 500,
        transactions: 200,
      },
    }
  } catch (error) {
    console.error("Error seeding analytics data:", error)
    return {
      success: false,
      error: "Failed to seed analytics data",
      details: error.message,
    }
  }
}
