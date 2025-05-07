"use server"

import { executeQuery } from "@/lib/neon/client"

// Get overview metrics for the dashboard
export async function getOverviewMetrics() {
  try {
    const query = `
      WITH view_stats AS (
        SELECT 
          COUNT(*) as total_views,
          COUNT(DISTINCT user_id) as unique_viewers
        FROM analytics.content_views
        WHERE created_at >= NOW() - INTERVAL '30 days'
      ),
      revenue_stats AS (
        SELECT 
          SUM(amount) as total_revenue,
          COUNT(*) as transaction_count
        FROM analytics.transactions
        WHERE created_at >= NOW() - INTERVAL '30 days'
      ),
      engagement_stats AS (
        SELECT 
          COUNT(*) as total_engagements,
          COUNT(DISTINCT user_id) as engaged_users
        FROM analytics.user_engagement
        WHERE created_at >= NOW() - INTERVAL '30 days'
      )
      SELECT 
        COALESCE(vs.total_views, 0) as total_views,
        COALESCE(vs.unique_viewers, 0) as unique_viewers,
        COALESCE(rs.total_revenue, 0) as total_revenue,
        COALESCE(rs.transaction_count, 0) as transaction_count,
        COALESCE(es.total_engagements, 0) as total_engagements,
        COALESCE(es.engaged_users, 0) as engaged_users
      FROM 
        view_stats vs,
        revenue_stats rs,
        engagement_stats es
    `

    const result = await executeQuery(query)
    return (
      result[0] || {
        total_views: 0,
        unique_viewers: 0,
        total_revenue: 0,
        transaction_count: 0,
        total_engagements: 0,
        engaged_users: 0,
      }
    )
  } catch (error) {
    console.error("Error getting overview metrics:", error)
    return {
      total_views: 0,
      unique_viewers: 0,
      total_revenue: 0,
      transaction_count: 0,
      total_engagements: 0,
      engaged_users: 0,
    }
  }
}

// Get daily views for charting
export async function getDailyViews() {
  try {
    const query = `
      WITH date_series AS (
        SELECT generate_series(
          current_date - interval '29 days',
          current_date,
          interval '1 day'
        )::date as date
      )
      SELECT 
        to_char(ds.date, 'YYYY-MM-DD') as date,
        COALESCE(COUNT(cv.id), 0) as views
      FROM date_series ds
      LEFT JOIN analytics.content_views cv 
        ON ds.date = date_trunc('day', cv.created_at)::date
      GROUP BY ds.date
      ORDER BY ds.date
    `

    return await executeQuery(query)
  } catch (error) {
    console.error("Error getting daily views:", error)
    return []
  }
}

// Get daily revenue for charting
export async function getDailyRevenue() {
  try {
    const query = `
      WITH date_series AS (
        SELECT generate_series(
          current_date - interval '29 days',
          current_date,
          interval '1 day'
        )::date as date
      )
      SELECT 
        to_char(ds.date, 'YYYY-MM-DD') as date,
        COALESCE(SUM(t.amount), 0) as revenue
      FROM date_series ds
      LEFT JOIN analytics.transactions t 
        ON ds.date = date_trunc('day', t.created_at)::date
      GROUP BY ds.date
      ORDER BY ds.date
    `

    return await executeQuery(query)
  } catch (error) {
    console.error("Error getting daily revenue:", error)
    return []
  }
}

// Get top performing content
export async function getTopContent(limit = 10) {
  try {
    const query = `
      SELECT 
        cv.content_id,
        COUNT(*) as views,
        COUNT(DISTINCT cv.user_id) as unique_viewers,
        COALESCE(SUM(t.amount), 0) as revenue,
        COUNT(DISTINCT ue.id) as engagements
      FROM analytics.content_views cv
      LEFT JOIN analytics.transactions t ON cv.content_id = t.content_id
      LEFT JOIN analytics.user_engagement ue ON cv.content_id = ue.content_id
      GROUP BY cv.content_id
      ORDER BY views DESC
      LIMIT $1
    `

    return await executeQuery(query, [limit])
  } catch (error) {
    console.error("Error getting top content:", error)
    return []
  }
}

// Get engagement metrics by type
export async function getEngagementByType() {
  try {
    const query = `
      SELECT 
        event_type,
        COUNT(*) as count
      FROM analytics.user_engagement
      GROUP BY event_type
      ORDER BY count DESC
    `

    return await executeQuery(query)
  } catch (error) {
    console.error("Error getting engagement by type:", error)
    return []
  }
}
