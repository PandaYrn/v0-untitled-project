"use server"

import { executeQuery } from "@/lib/neon/client"
import { v4 as uuidv4 } from "uuid"

/**
 * Track a content view event
 */
export async function trackContentView({
  contentId,
  userId,
  sessionId = uuidv4(),
  viewDuration,
  platform,
  country,
  referrer,
}: {
  contentId: string
  userId?: string | null
  sessionId?: string
  viewDuration?: number
  platform?: string
  country?: string
  referrer?: string
}) {
  try {
    const query = `
      INSERT INTO analytics.content_views 
      (content_id, user_id, session_id, view_duration, platform, country, referrer)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `

    const result = await executeQuery(query, [contentId, userId, sessionId, viewDuration, platform, country, referrer])

    return { success: true, id: result[0]?.id }
  } catch (error) {
    console.error("Error tracking content view:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Track a user engagement event
 */
export async function trackEngagement({
  userId,
  eventType,
  contentId,
  metadata,
}: {
  userId: string
  eventType: string
  contentId?: string | null
  metadata?: Record<string, any> | null
}) {
  try {
    const query = `
      INSERT INTO analytics.user_engagement 
      (user_id, event_type, content_id, metadata)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `

    const result = await executeQuery(query, [userId, eventType, contentId, metadata ? JSON.stringify(metadata) : null])

    return { success: true, id: result[0]?.id }
  } catch (error) {
    console.error("Error tracking engagement:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Track a transaction event
 */
export async function trackTransaction({
  transactionId = uuidv4(),
  userId,
  contentId,
  eventId,
  transactionType,
  amount,
  currency = "SUI",
  platformFee,
  creatorRevenue,
  paymentMethod,
  transactionStatus = "completed",
}: {
  transactionId?: string
  userId: string
  contentId?: string | null
  eventId?: string | null
  transactionType: string
  amount: number
  currency?: string
  platformFee?: number
  creatorRevenue?: number
  paymentMethod?: string
  transactionStatus?: string
}) {
  try {
    const query = `
      INSERT INTO analytics.transactions 
      (transaction_id, user_id, content_id, event_id, transaction_type, 
       amount, currency, platform_fee, creator_revenue, payment_method, transaction_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `

    const result = await executeQuery(query, [
      transactionId,
      userId,
      contentId,
      eventId,
      transactionType,
      amount,
      currency,
      platformFee,
      creatorRevenue,
      paymentMethod,
      transactionStatus,
    ])

    return { success: true, id: result[0]?.id }
  } catch (error) {
    console.error("Error tracking transaction:", error)
    return { success: false, error: error.message }
  }
}
