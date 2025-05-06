"use client"

/**
 * Analytics namespace for client-side tracking functions
 */
export const Analytics = {
  trackContentView,
  trackEngagement,
  trackTransaction,
}

/**
 * Track a content view from the client side
 */
export async function trackContentView({
  contentId,
  userId,
  viewDuration,
  referrer,
}: {
  contentId: string
  userId?: string | null
  viewDuration?: number
  referrer?: string
}) {
  try {
    // Get platform info
    const platform = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      ? "mobile"
      : "web"

    // Get country (in a real app, you might use a geolocation service)
    // For now, we'll leave it blank and let the server determine it

    const response = await fetch("/api/analytics/content-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentId,
        userId,
        viewDuration,
        platform,
        referrer: referrer || document.referrer || null,
      }),
    })

    return await response.json()
  } catch (error) {
    console.error("Error tracking content view:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Track a user engagement event from the client side
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
    const response = await fetch("/api/analytics/engagement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        eventType,
        contentId,
        metadata,
      }),
    })

    return await response.json()
  } catch (error) {
    console.error("Error tracking engagement:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Track a transaction from the client side
 */
export async function trackTransaction({
  userId,
  contentId,
  eventId,
  transactionType,
  amount,
  currency = "SUI",
  paymentMethod,
}: {
  userId: string
  contentId?: string | null
  eventId?: string | null
  transactionType: string
  amount: number
  currency?: string
  paymentMethod?: string
}) {
  try {
    const response = await fetch("/api/analytics/transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        contentId,
        eventId,
        transactionType,
        amount,
        currency,
        paymentMethod,
      }),
    })

    return await response.json()
  } catch (error) {
    console.error("Error tracking transaction:", error)
    return { success: false, error: error.message }
  }
}
