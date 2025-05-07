import { sql, executeQuery } from "@/lib/neon/client"

// Types for analytics data
export type OverviewMetrics = {
  totalViews: number
  totalRevenue: number
  totalEngagements: number
  activeUsers: number
}

export type DailyViewsData = {
  date: string
  count: number
}

export type DailyRevenueData = {
  date: string
  amount: number
}

export type ContentPerformance = {
  contentId: string
  title: string
  views: number
  revenue: number
  engagements: number
}

export type EngagementByType = {
  type: string
  count: number
}

// Get overview metrics
export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  try {
    const [viewsResult, revenueResult, engagementsResult, usersResult] = await Promise.all([
      executeQuery<{ count: number }>(
        `SELECT COUNT(*) as count FROM analytics.content_views`
      ),
      executeQuery<{ sum: number }>(
        `SELECT COALESCE(SUM(amount), 0) as sum FROM analytics.transactions`
      ),
      executeQuery<{ count: number }>(
        `SELECT COUNT(*) as count FROM analytics.user_engagements`
      ),
      executeQuery<{ count: number }>(
        `SELECT COUNT(DISTINCT user_id) as count FROM analytics.content_views WHERE created_at > NOW() - INTERVAL '30 days'`
      ),
    ])

    return {
      totalViews: viewsResult[0]?.count || 0,
      totalRevenue: revenueResult[0]?.sum || 0,
      totalEngagements: engagementsResult[0]?.count || 0,
      activeUsers: usersResult[0]?.count || 0,
    }
  } catch (error) {
    console.error("Error getting overview metrics:", error)
    return {
      totalViews: 0,
      totalRevenue: 0,
      totalEngagements: 0,
      activeUsers: 0,
    }
  }
}

// Get daily views for the last 30 days
export async function getDailyViews(): Promise<DailyViewsData[]> {
  try {
    return await executeQuery<DailyViewsData>(
      `SELECT 
        TO_CHAR(date, 'YYYY-MM-DD') as date,
        COUNT as count
      FROM analytics.daily_metrics
      WHERE metric_type = 'views'
      AND date > NOW() - INTERVAL '30 days'
      ORDER BY date ASC`
    )
  } catch (error) {
    console.error("Error getting daily views:", error)
    return []
  }
}

// Get daily revenue for the last 30 days
export async function getDailyRevenue(): Promise<DailyRevenueData[]> {
  try {
    return await executeQuery<DailyRevenueData>(
      `SELECT 
        TO_CHAR(date, 'YYYY-MM-DD') as date,
        SUM(value) as amount
      FROM analytics.daily_metrics
      WHERE metric_type = 'revenue'
      AND date > NOW() - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date ASC`
    )
  } catch (error) {
    console.error("Error getting daily revenue:", error)
    return []
  }
}

// Get top performing content
export async function getTopContent(limit: number = 10): Promise<ContentPerformance[]> {
  try {
    return await executeQuery<ContentPerformance>(
      `SELECT 
        cv.content_id as "contentId",
        COALESCE(c.title, cv.content_id) as title,
        COUNT(DISTINCT cv.id) as views,
        COALESCE(SUM(t.amount), 0) as revenue,
        COUNT(DISTINCT ue.id) as engagements
      FROM analytics.content_views cv
      LEFT JOIN analytics.transactions t ON cv.content_id = t.content_id
      LEFT JOIN analytics.user_engagements ue ON cv.content_id = ue.content_id
      LEFT JOIN (
        SELECT id, title FROM content.music
        UNION ALL
        SELECT id, title FROM content.movies
      ) c ON cv.content_id = c.id
      GROUP BY cv.content_id, c.title
      ORDER BY views DESC
      LIMIT $1`,
      [limit]
    )
  } catch (error) {
    console.error("Error getting top content:", error)
    return []
  }
}

// Get engagement by type
export async function getEngagementByType(): Promise<EngagementByType[]> {
  try {
    return await executeQuery<EngagementByType>(
      `SELECT 
        engagement_type as type,
        COUNT(*) as count
      FROM analytics.user_engagements
      GROUP BY engagement_type
      ORDER BY count DESC`
    )
  } catch (error) {
    console.error("Error getting engagement by type:", error)
    return []
  }
}
