"use server"

import { executeQuery } from "@/lib/neon/client"

/**
 * Get overview metrics for the dashboard
 */
export async function getOverviewMetrics(days = 30) {
  try {
    const query = `
      WITH view_stats AS (
        SELECT 
          COUNT(*) as total_views,
          COUNT(DISTINCT content_id) as viewed_content,
          COUNT(DISTINCT user_id) as unique_viewers,
          AVG(view_duration) as avg_duration
        FROM analytics.content_views
        WHERE view_timestamp >= NOW() - INTERVAL '${days} days'
      ),
      transaction_stats AS (
        SELECT 
          COUNT(*) as total_transactions,
          SUM(amount) as total_revenue,
          AVG(amount) as avg_transaction
        FROM analytics.transactions
        WHERE transaction_timestamp >= NOW() - INTERVAL '${days} days'
      ),
      engagement_stats AS (
        SELECT 
          COUNT(*) as total_engagements,
          COUNT(DISTINCT user_id) as engaged_users
        FROM analytics.user_engagement
        WHERE event_timestamp >= NOW() - INTERVAL '${days} days'
      )
      SELECT 
        v.total_views, v.viewed_content, v.unique_viewers, v.avg_duration,
        t.total_transactions, t.total_revenue, t.avg_transaction,
        e.total_engagements, e.engaged_users
      FROM view_stats v, transaction_stats t, engagement_stats e
    `

    const result = await executeQuery(query)
    return result[0] || null
  } catch (error) {
    console.error("Error getting overview metrics:", error)
    throw error
  }
}

/**
 * Get daily view counts for charting
 */
export async function getDailyViews(days = 30) {
  try {
    const query = `
      SELECT 
        DATE(view_timestamp) as date,
        COUNT(*) as views,
        COUNT(DISTINCT user_id) as unique_viewers
      FROM analytics.content_views
      WHERE view_timestamp >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(view_timestamp)
      ORDER BY date
    `

    return await executeQuery(query)
  } catch (error) {
    console.error("Error getting daily views:", error)
    throw error
  }
}

/**
 * Get daily revenue for charting
 */
export async function getDailyRevenue(days = 30) {
  try {
    const query = `
      SELECT 
        DATE(transaction_timestamp) as date,
        SUM(amount) as revenue,
        COUNT(*) as transactions
      FROM analytics.transactions
      WHERE transaction_timestamp >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(transaction_timestamp)
      ORDER BY date
    `

    return await executeQuery(query)
  } catch (error) {
    console.error("Error getting daily revenue:", error)
    throw error
  }
}

/**
 * Get top performing content
 */
export async function getTopContent(limit = 10) {
  try {
    const query = `
      WITH content_metrics AS (
        SELECT 
          content_id,
          COUNT(*) as views,
          COUNT(DISTINCT user_id) as unique_viewers,
          AVG(view_duration) as avg_duration
        FROM analytics.content_views
        GROUP BY content_id
      ),
      content_revenue AS (
        SELECT 
          content_id,
          SUM(amount) as revenue,
          COUNT(*) as transactions
        FROM analytics.transactions
        WHERE content_id IS NOT NULL
        GROUP BY content_id
      ),
      content_engagement AS (
        SELECT 
          content_id,
          COUNT(*) as engagements
        FROM analytics.user_engagement
        WHERE content_id IS NOT NULL
        GROUP BY content_id
      )
      SELECT 
        cm.content_id,
        cm.views,
        cm.unique_viewers,
        cm.avg_duration,
        COALESCE(cr.revenue, 0) as revenue,
        COALESCE(cr.transactions, 0) as transactions,
        COALESCE(ce.engagements, 0) as engagements
      FROM content_metrics cm
      LEFT JOIN content_revenue cr ON cm.content_id = cr.content_id
      LEFT JOIN content_engagement ce ON cm.content_id = ce.content_id
      ORDER BY cm.views DESC
      LIMIT ${limit}
    `

    return await executeQuery(query)
  } catch (error) {
    console.error("Error getting top content:", error)
    throw error
  }
}

/**
 * Get engagement metrics by type
 */
export async function getEngagementByType(days = 30) {
  try {
    const query = `
      SELECT 
        event_type,
        COUNT(*) as count
      FROM analytics.user_engagement
      WHERE event_timestamp >= NOW() - INTERVAL '${days} days'
      GROUP BY event_type
      ORDER BY count DESC
    `

    return await executeQuery(query)
  } catch (error) {
    console.error("Error getting engagement by type:", error)
    throw error
  }
}
