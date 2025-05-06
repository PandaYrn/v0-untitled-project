import { executeQuery } from "@/lib/neon/client"

/**
 * Seed the analytics database with sample data
 */
export async function seedAnalyticsData() {
  try {
    console.log("Starting analytics data seeding...")
    
    // Check if database connection is working
    try {
      await executeQuery("SELECT 1")
      console.log("Database connection successful")
    } catch (error) {
      console.error("Database connection failed:", error)
      return {
        success: false,
        error: "Database connection failed",
        details: error.message
      }
    }
    
    // Create schema if it doesn't exist
    try {
      await executeQuery(`
        CREATE SCHEMA IF NOT EXISTS analytics;
      `)
      console.log("Analytics schema created or already exists")
    } catch (error) {
      console.error("Failed to create schema:", error)
      return {
        success: false,
        error: "Failed to create schema",
        details: error.message
      }
    }
    
    // Create tables if they don't exist
    try {
      // Content views table
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS analytics.content_views (
          id SERIAL PRIMARY KEY,
          content_id TEXT NOT NULL,
          user_id TEXT,
          view_duration INTEGER,
          platform TEXT,
          country TEXT,
          referrer TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)
      
      // User engagement table
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS analytics.user_engagement (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          event_type TEXT NOT NULL,
          content_id TEXT,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)
      
      // Transactions table
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS analytics.transactions (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          content_id TEXT,
          event_id TEXT,
          transaction_type TEXT NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          currency TEXT NOT NULL,
          payment_method TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)
      
      // Daily metrics table
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS analytics.daily_metrics (
          id SERIAL PRIMARY KEY,
          date DATE NOT NULL,
          total_views INTEGER NOT NULL DEFAULT 0,
          unique_viewers INTEGER NOT NULL DEFAULT 0,
          total_revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
          new_users INTEGER NOT NULL DEFAULT 0,
          CONSTRAINT unique_date UNIQUE (date)
        );
      `)
      
      console.log("Analytics tables created or already exist")
    } catch (error) {
      console.error("Failed to create tables:", error)
      return {
        success: false,
        error: "Failed to create tables",
        details: error.message
      }
    }
    
    // Generate sample data
    try {
      // Sample content IDs
      const contentIds = [
        "c1b8c174-dd21-4b82-a9c1-f984e32dd3f7",
        "7f8d9e10-c5a3-4b1d-8e7f-6a2b3c4d5e6f",
        "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
        "5f4e3d2c-1b0a-9f8e-7d6c-5b4a3c2d1e0f"
      ]
      
      // Sample user IDs
      const userIds = [
        "u1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        "u2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7",
        "u3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8",
        "u4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9",
        "u5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0"
      ]
      
      // Sample platforms
      const platforms = ["web", "mobile", "desktop"]
      
      // Sample countries
      const countries = ["US", "UK", "CA", "AU", "DE", "FR", "JP", "BR", "IN"]
      
      // Sample referrers
      const referrers = [
        "https://google.com",
        "https://twitter.com",
        "https://facebook.com",
        "https://instagram.com",
        "https://youtube.com",
        "direct",
        null
      ]
      
      // Sample event types
      const eventTypes = [
        "like",
        "comment",
        "share",
        "follow",
        "playlist_add",
        "download",
        "subscribe"
      ]
      
      // Sample transaction types
      const transactionTypes = [
        "purchase",
        "subscription",
        "rental",
        "tip",
        "nft_purchase",
        "ticket_purchase"
      ]
      
      // Sample payment methods
      const paymentMethods = [
        "credit_card",
        "paypal",
        "crypto",
        "bank_transfer",
        "mobile_payment"
      ]
      
      // Generate random date within the last 30 days
      const getRandomDate = () => {
        const now = new Date()
        const daysAgo = Math.floor(Math.random() * 30)
        now.setDate(now.getDate() - daysAgo)
        return now.toISOString()
      }
      
      // Generate random number between min and max
      const getRandomNumber = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min
      }
      
      // Generate random element from array
      const getRandomElement = <T>(array: T[]): T => {
        return array[Math.floor(Math.random() * array.length)]
      }
      
      // Clear existing data
      await executeQuery(`TRUNCATE analytics.content_views CASCADE;`)
      await executeQuery(`TRUNCATE analytics.user_engagement CASCADE;`)
      await executeQuery(`TRUNCATE analytics.transactions CASCADE;`)
      await executeQuery(`TRUNCATE analytics.daily_metrics CASCADE;`)
      
      console.log("Existing data cleared")
      
      // Generate content views
      const viewsCount = 1000
      for (let i = 0; i < viewsCount; i++) {
        const contentId = getRandomElement(contentIds)
        const userId = Math.random() > 0.3 ? getRandomElement(userIds) : null // 30% anonymous views
        const viewDuration = getRandomNumber(10, 3600) // 10 seconds to 1 hour
        const platform = getRandomElement(platforms)
        const country = getRandomElement(countries)
        const referrer = getRandomElement(referrers)
        const createdAt = getRandomDate()
        
        await executeQuery(`
          INSERT INTO analytics.content_views (
            content_id, user_id, view_duration, platform, country, referrer, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [contentId, userId, viewDuration, platform, country, referrer, createdAt])
      }
      
      console.log(`${viewsCount} content views generated`)
      
      // Generate user engagement
      const engagementCount = 500
      for (let i = 0; i < engagementCount; i++) {
        const userId = getRandomElement(userIds)
        const eventType = getRandomElement(eventTypes)
        const contentId = Math.random() > 0.1 ? getRandomElement(contentIds) : null
        const metadata = {
          value: getRandomNumber(1, 100),
          details: `Sample ${eventType} event`
        }
        const createdAt = getRandomDate()
        
        await executeQuery(`
          INSERT INTO analytics.user_engagement (
            user_id, event_type, content_id, metadata, created_at
          ) VALUES ($1, $2, $3, $4, $5)
        `, [userId, eventType, contentId, JSON.stringify(metadata), createdAt])
      }
      
      console.log(`${engagementCount} user engagement events generated`)
      
      // Generate transactions
      const transactionsCount = 300
      for (let i = 0; i < transactionsCount; i++) {
        const userId = getRandomElement(userIds)
        const transactionType = getRandomElement(transactionTypes)
        const contentId = Math.random() > 0.2 ? getRandomElement(contentIds) : null
        const eventId = Math.random() > 0.8 ? `event-${getRandomNumber(1000, 9999)}` : null
        const amount = parseFloat((Math.random() * 100).toFixed(2))
        const currency = "SUI"
        const paymentMethod = getRandomElement(paymentMethods)
        const createdAt = getRandomDate()
        
        await executeQuery(`
          INSERT INTO analytics.transactions (
            user_id, content_id, event_id, transaction_type, amount, currency, payment_method, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [userId, contentId, eventId, transactionType, amount, currency, paymentMethod, createdAt])
      }
      
      console.log(`${transactionsCount} transactions generated`)
      
      // Generate daily metrics
      await executeQuery(`
        INSERT INTO analytics.daily_metrics (date, total_views, unique_viewers, total_revenue, new_users)
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_views,
          COUNT(DISTINCT user_id) as unique_viewers,
          0 as total_revenue,
          0 as new_users
        FROM analytics.content_views
        GROUP BY DATE(created_at)
      `)
      
      // Update revenue in daily metrics
      await executeQuery(`
        UPDATE analytics.daily_metrics dm
        SET total_revenue = t.daily_revenue
        FROM (
          SELECT 
            DATE(created_at) as date,
            SUM(amount) as daily_revenue
          FROM analytics.transactions
          GROUP BY DATE(created_at)
        ) t
        WHERE dm.date = t.date
      `)
      
      // Update new users in daily metrics (simplified)
      await executeQuery(`
        UPDATE analytics.daily_metrics
        SET new_users = FLOOR(random() * 50)::int
      `)
      
      console.log("Daily metrics generated")
      
      // Create indexes for better query performance
      await executeQuery(`
        CREATE INDEX IF NOT EXISTS idx_content_views_content_id ON analytics.content_views(content_id);
        CREATE INDEX IF NOT EXISTS idx_content_views_user_id ON analytics.content_views(user_id);
        CREATE INDEX IF NOT EXISTS idx_content_views_created_at ON analytics.content_views(created_at);
        
        CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON analytics.user_engagement(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_engagement_event_type ON analytics.user_engagement(event_type);
        CREATE INDEX IF NOT EXISTS idx_user_engagement_content_id ON analytics.user_engagement(content_id);
        
        CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON analytics.transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_content_id ON analytics.transactions(content_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_transaction_type ON analytics.transactions(transaction_type);
      `)
      
      console.log("Indexes created")
      
      return {
        success: true,
        message: "Analytics data seeded successfully",
        stats: {
          views: viewsCount,
          engagements: engagementCount,
          transactions: transactionsCount
        }
      }
    } catch (error) {
      console.error("Failed to generate sample data:", error)
      return {
        success: false,
        error: "Failed to generate sample data",
        details: error.message
      }
    }
  } catch (error) {
    console.error("Seed analytics data failed:", error)
    return {
      success: false,
      error: "Seed analytics data failed",
      details: error.message
    }
  }
}
