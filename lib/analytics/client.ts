"use client"

import { useState, useEffect } from "react"

// Track content view
export async function trackContentView(contentId: string, contentType: string) {
  try {
    await fetch("/api/analytics/content-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentId,
        contentType,
      }),
    })
  } catch (error) {
    console.error("Error tracking content view:", error)
  }
}

// Track user engagement
export async function trackEngagement(contentId: string, engagementType: string) {
  try {
    await fetch("/api/analytics/engagement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentId,
        engagementType,
      }),
    })
  } catch (error) {
    console.error("Error tracking engagement:", error)
  }
}

// Track transaction
export async function trackTransaction(contentId: string, transactionType: string, amount: number) {
  try {
    await fetch("/api/analytics/transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentId,
        transactionType,
        amount,
      }),
    })
  } catch (error) {
    console.error("Error tracking transaction:", error)
  }
}

// Export Analytics namespace for components that import it
export const Analytics = {
  trackContentView,
  trackEngagement,
  trackTransaction,
}

// Hook for tracking view duration
export function useTrackViewDuration(contentId: string, contentType: string) {
  const [startTime] = useState<number>(Date.now())

  useEffect(() => {
    // Track initial view
    trackContentView(contentId, contentType)

    return () => {
      // Calculate duration when component unmounts
      const duration = Math.floor((Date.now() - startTime) / 1000) // duration in seconds
      
      // Only track if viewed for more than 5 seconds
      if (duration >= 5) {
        trackEngagement(contentId, "duration")
      }
    }
  }, [contentId, contentType, startTime])
}
