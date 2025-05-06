import { executeQuery } from "@/lib/neon/client"

/**
 * Get overview metrics for the analytics dashboard
 */
export async function getOverviewMetrics() {
  try {
    // Default values in case of database errors
    const defaultMetrics = {
      totalViews: 0,
      totalUsers: 0,
      totalRevenue: 0,
      conversionRate: 0,
    }

    // Query for total views
    const viewsResult = await executeQuery(`
      SELECT COUNT(*) as total_views FROM analytics.content_views
    `)

    // Query for unique users
    const usersResult = await executeQuery(`
      SELECT COUNT(DISTINCT user_id) as total_users FROM analytics.content_views
      WHERE user_id IS NOT NULL
    `)

    // Query for total revenue
    const revenueResult = await executeQuery(`
      SELECT SUM(amount) as total_revenue FROM analytics.transactions
    `)

    // Query for conversion rate (users who made a purchase / total users)
    const conversionResult = await executeQuery(`
      WITH total_users AS (
        SELECT COUNT(DISTINCT user_id) as count FROM analytics.content_views WHERE user_id IS NOT NULL
      ),
      paying_users AS (
        SELECT COUNT(DISTINCT user_id) as count FROM analytics.transactions
      )
      SELECT 
        CASE 
          WHEN tu.count = 0 THEN 0
          ELSE (pu.count::float / tu.count::float) * 100 
        END as conversion_rate
      FROM total_users tu, paying_users pu
    `)

    // Extract values from results or use defaults
    const totalViews = viewsResult?.[0]?.total_views || defaultMetrics.totalViews
    const totalUsers = usersResult?.[0]?.total_users || defaultMetrics.totalUsers
    const totalRevenue = revenueResult?.[0]?.total_revenue || defaultMetrics.totalRevenue
    const conversionRate = conversionResult?.[0]?.conversion_rate || defaultMetrics.conversionRate

    return {
      totalViews: Number.parseInt(totalViews),
      totalUsers: Number.parseInt(totalUsers),
      totalRevenue: Number.parseFloat(totalRevenue) || 0,
      conversionRate: Number.parseFloat(conversionRate) || 0,
    }
  } catch (error) {
    console.error("Error getting overview metrics:", error)
    return {
      totalViews: 0,
      totalUsers: 0,
      totalRevenue: 0,
      conversionRate: 0,
    }
  }
}

/**
 * Get daily view counts for the last 30 days
 */
export async function getDailyViews() {
  try {
    const result = await executeQuery(`
      WITH date_series AS (
        SELECT generate_series(
          current_date - interval '29 days',
          current_date,
          interval '1 day'
        )::date as date
      )
      SELECT 
        ds.date,
        COALESCE(COUNT(cv.id), 0) as view_count
      FROM date_series ds
      LEFT JOIN analytics.content_views cv ON ds.date = DATE(cv.created_at)
      GROUP BY ds.date
      ORDER BY ds.date
    `)

    return (
      result.map((row) => ({
        date: row.date,
        views: Number.parseInt(row.view_count),
      })) || []
    )
  } catch (error) {
    console.error("Error getting daily views:", error)
    return []
  }
}

/**
 * Get daily revenue for the last 30 days
 */
export async function getDailyRevenue() {
  try {
    const result = await executeQuery(`
      WITH date_series AS (
        SELECT generate_series(
          current_date - interval '29 days',
          current_date,
          interval '1 day'
        )::date as date
      )
      SELECT 
        ds.date,
        COALESCE(SUM(t.amount), 0) as revenue
      FROM date_series ds
      LEFT JOIN analytics.transactions t ON ds.date = DATE(t.created_at)
      GROUP BY ds.date
      ORDER BY ds.date
    `)

    return (
      result.map((row) => ({
        date: row.date,
        revenue: Number.parseFloat(row.revenue) || 0,
      })) || []
    )
  } catch (error) {
    console.error("Error getting daily revenue:", error)
    return []
  }
}

/**
 * Get top performing content
 */
export async function getTopContent() {
  try {
    const result = await executeQuery(`
      SELECT 
        c.id,
        c.title,
        c.content_type,
        COUNT(cv.id) as view_count,
        COUNT(DISTINCT cv.user_id) as unique_viewers,
        COALESCE(SUM(t.amount), 0) as revenue
      FROM content c
      LEFT JOIN analytics.content_views cv ON c.id = cv.content_id
      LEFT JOIN analytics.transactions t ON c.id = t.content_id
      GROUP BY c.id, c.title, c.content_type
      ORDER BY view_count DESC
      LIMIT 10
    `)

    return (
      result.map((row) => ({
        id: row.id,
        title: row.title,
        contentType: row.content_type,
        viewCount: Number.parseInt(row.view_count),
        uniqueViewers: Number.parseInt(row.unique_viewers),
        revenue: Number.parseFloat(row.revenue) || 0,
      })) || []
    )
  } catch (error) {
    console.error("Error getting top content:", error)
    return []
  }
}

/**
 * Get engagement metrics by type
 */
export async function getEngagementByType() {
  try {
    const result = await executeQuery(`
      SELECT 
        event_type,
        COUNT(*) as count
      FROM analytics.user_engagement
      GROUP BY event_type
      ORDER BY count DESC
    `)

    return (
      result.map((row) => ({
        type: row.event_type,
        count: Number.parseInt(row.count),
      })) || []
    )
  } catch (error) {
    console.error("Error getting engagement by type:", error)
    return []
  }
}

/**
 * Get content performance by creator
 */
export async function getContentByCreator(creatorId: string) {
  try {
    const result = await executeQuery(
      `
      SELECT 
        c.id,
        c.title,
        c.content_type,
        COUNT(cv.id) as view_count,
        COALESCE(SUM(t.amount), 0) as revenue
      FROM content c
      LEFT JOIN analytics.content_views cv ON c.id = cv.content_id
      LEFT JOIN analytics.transactions t ON c.id = t.content_id
      WHERE c.creator_id = $1
      GROUP BY c.id, c.title, c.content_type
      ORDER BY view_count DESC
    `,
      [creatorId],
    )

    return (
      result.map((row) => ({
        id: row.id,
        title: row.title,
        contentType: row.content_type,
        viewCount: Number.parseInt(row.view_count),
        revenue: Number.parseFloat(row.revenue) || 0,
      })) || []
    )
  } catch (error) {
    console.error("Error getting content by creator:", error)
    return []
  }
}
