import { sql, testConnection } from "@/lib/neon/client"

// Function to generate a random date within the last 30 days
function randomRecentDate() {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 30)
  now.setDate(now.getDate() - daysAgo)
  return now.toISOString()
}

// Function to generate a random amount between min and max
function randomAmount(min: number, max: number) {
  return Number.parseFloat((Math.random() * (max - min) + min).toFixed(2))
}

// Function to generate a random user ID
function randomUserId() {
  return `user_${Math.floor(Math.random() * 1000)}`
}

// Function to generate a random content ID
function randomContentId() {
  const contentType = Math.random() > 0.5 ? "music" : "movie"
  return `${contentType}_${Math.floor(Math.random() * 100)}`
}

// Function to generate a random engagement type
function randomEngagementType() {
  const types = ["like", "comment", "share", "save", "duration"]
  return types[Math.floor(Math.random() * types.length)]
}

// Function to generate a random transaction type
function randomTransactionType() {
  const types = ["purchase", "rental", "subscription", "royalty"]
  return types[Math.floor(Math.random() * types.length)]
}

// Function to get a random element from an array
function getRandomElement<ElementType>(array: ElementType[]): ElementType {
  return array[Math.floor(Math.random() * array.length)]
}

// Create analytics schema and tables
async function createSchema() {
  try {
    console.log("Creating analytics schema and tables...")

    // Create schema
    await sql`CREATE SCHEMA IF NOT EXISTS analytics`

    // Create content_views table
    await sql`
      CREATE TABLE IF NOT EXISTS analytics.content_views (
        id SERIAL PRIMARY KEY,
        content_id TEXT NOT NULL,
        content_type TEXT NOT NULL,
        user_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        session_id TEXT,
        referrer TEXT,
        device TEXT
      )
    `

    // Create user_engagements table
    await sql`
      CREATE TABLE IF NOT EXISTS analytics.user_engagements (
        id SERIAL PRIMARY KEY,
        content_id TEXT NOT NULL,
        user_id TEXT,
        engagement_type TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        value TEXT
      )
    `

    // Create transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS analytics.transactions (
        id SERIAL PRIMARY KEY,
        content_id TEXT NOT NULL,
        user_id TEXT,
        transaction_type TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status TEXT DEFAULT 'completed'
      )
    `

    // Create daily_metrics table for aggregated data
    await sql`
      CREATE TABLE IF NOT EXISTS analytics.daily_metrics (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        metric_type TEXT NOT NULL,
        content_type TEXT,
        value DECIMAL(10, 2) NOT NULL,
        count INTEGER NOT NULL
      )
    `

    // Create indexes for better query performance
    await sql`CREATE INDEX IF NOT EXISTS idx_content_views_content_id ON analytics.content_views(content_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_content_views_created_at ON analytics.content_views(created_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_user_engagements_content_id ON analytics.user_engagements(content_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_content_id ON analytics.transactions(content_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON analytics.daily_metrics(date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_metrics_type ON analytics.daily_metrics(metric_type)`

    console.log("Schema and tables created successfully")
    return true
  } catch (error) {
    console.error("Error creating schema and tables:", error)
    return false
  }
}

// Seed content views
async function seedContentViews(count: number) {
  try {
    console.log(`Seeding ${count} content views...`)

    for (let i = 0; i < count; i++) {
      const contentId = randomContentId()
      const contentType = contentId.split("_")[0]
      const userId = Math.random() > 0.3 ? randomUserId() : null // 30% anonymous views
      const createdAt = randomRecentDate()

      await sql`
        INSERT INTO analytics.content_views 
        (content_id, content_type, user_id, created_at, session_id, device)
        VALUES 
        (${contentId}, ${contentType}, ${userId}, ${createdAt}, ${`session_${Math.floor(Math.random() * 5000)}`}, ${Math.random() > 0.7 ? "mobile" : "desktop"})
      `
    }

    console.log(`${count} content views seeded successfully`)
    return true
  } catch (error) {
    console.error("Error seeding content views:", error)
    return false
  }
}

// Seed user engagements
async function seedUserEngagements(count: number) {
  try {
    console.log(`Seeding ${count} user engagements...`)

    for (let i = 0; i < count; i++) {
      const contentId = randomContentId()
      const userId = randomUserId()
      const engagementType = randomEngagementType()
      const createdAt = randomRecentDate()

      await sql`
        INSERT INTO analytics.user_engagements 
        (content_id, user_id, engagement_type, created_at, value)
        VALUES 
        (${contentId}, ${userId}, ${engagementType}, ${createdAt}, ${engagementType === "comment" ? "Great content!" : null})
      `
    }

    console.log(`${count} user engagements seeded successfully`)
    return true
  } catch (error) {
    console.error("Error seeding user engagements:", error)
    return false
  }
}

// Seed transactions
async function seedTransactions(count: number) {
  try {
    console.log(`Seeding ${count} transactions...`)

    for (let i = 0; i < count; i++) {
      const contentId = randomContentId()
      const userId = randomUserId()
      const transactionType = randomTransactionType()
      const createdAt = randomRecentDate()

      // Different price ranges based on transaction type
      let amount = 0
      switch (transactionType) {
        case "purchase":
          amount = randomAmount(9.99, 29.99)
          break
        case "rental":
          amount = randomAmount(2.99, 5.99)
          break
        case "subscription":
          amount = randomAmount(9.99, 19.99)
          break
        case "royalty":
          amount = randomAmount(0.1, 2.5)
          break
      }

      await sql`
        INSERT INTO analytics.transactions 
        (content_id, user_id, transaction_type, amount, created_at)
        VALUES 
        (${contentId}, ${userId}, ${transactionType}, ${amount}, ${createdAt})
      `
    }

    console.log(`${count} transactions seeded successfully`)
    return true
  } catch (error) {
    console.error("Error seeding transactions:", error)
    return false
  }
}

// Seed daily metrics
async function seedDailyMetrics() {
  try {
    console.log("Generating daily metrics from raw data...")

    // Clear existing daily metrics
    await sql`TRUNCATE TABLE analytics.daily_metrics`

    // Generate views metrics
    await sql`
      INSERT INTO analytics.daily_metrics (date, metric_type, content_type, value, count)
      SELECT 
        DATE(created_at) as date,
        'views' as metric_type,
        content_type,
        0 as value,
        COUNT(*) as count
      FROM analytics.content_views
      GROUP BY DATE(created_at), content_type
    `

    // Generate revenue metrics
    await sql`
      INSERT INTO analytics.daily_metrics (date, metric_type, content_type, value, count)
      SELECT 
        DATE(t.created_at) as date,
        'revenue' as metric_type,
        SPLIT_PART(t.content_id, '_', 1) as content_type,
        SUM(t.amount) as value,
        COUNT(*) as count
      FROM analytics.transactions t
      GROUP BY DATE(t.created_at), SPLIT_PART(t.content_id, '_', 1)
    `

    // Generate engagement metrics
    await sql`
      INSERT INTO analytics.daily_metrics (date, metric_type, content_type, value, count)
      SELECT 
        DATE(created_at) as date,
        'engagement' as metric_type,
        SPLIT_PART(content_id, '_', 1) as content_type,
        0 as value,
        COUNT(*) as count
      FROM analytics.user_engagements
      GROUP BY DATE(created_at), SPLIT_PART(content_id, '_', 1)
    `

    console.log("Daily metrics generated successfully")
    return true
  } catch (error) {
    console.error("Error generating daily metrics:", error)
    return false
  }
}

// Main seed function
export async function seedAnalyticsData() {
  console.log("Starting analytics data seeding...")

  // Test database connection
  const isConnected = await testConnection()
  if (!isConnected) {
    console.error("Database connection failed. Cannot seed data.")
    return {
      success: false,
      error: "Database connection failed",
    }
  }

  try {
    // Create schema and tables
    const schemaCreated = await createSchema()
    if (!schemaCreated) {
      return {
        success: false,
        error: "Failed to create schema and tables",
      }
    }

    // Seed data
    const viewsSeeded = await seedContentViews(500)
    const engagementsSeeded = await seedUserEngagements(300)
    const transactionsSeeded = await seedTransactions(200)

    if (!viewsSeeded || !engagementsSeeded || !transactionsSeeded) {
      return {
        success: false,
        error: "Failed to seed some data",
      }
    }

    // Generate daily metrics
    const metricsGenerated = await seedDailyMetrics()
    if (!metricsGenerated) {
      return {
        success: false,
        error: "Failed to generate daily metrics",
      }
    }

    console.log("Analytics data seeding completed successfully")
    return {
      success: true,
      views: 500,
      engagements: 300,
      transactions: 200,
    }
  } catch (error) {
    console.error("Error seeding analytics data:", error)
    return {
      success: false,
      error: String(error),
    }
  }
}
