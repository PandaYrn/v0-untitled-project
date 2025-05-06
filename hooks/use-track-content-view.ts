"use client"

import { useEffect, useRef } from "react"
import { trackContentView } from "@/lib/analytics/client"

export function useTrackContentView({
  contentId,
  userId,
  enabled = true,
}: {
  contentId: string
  userId?: string | null
  enabled?: boolean
}) {
  const startTimeRef = useRef<number>(Date.now())
  const hasTrackedRef = useRef<boolean>(false)

  // Track view when component mounts
  useEffect(() => {
    if (!enabled || !contentId || hasTrackedRef.current) return

    // Initial view tracking without duration
    trackContentView({
      contentId,
      userId,
    })

    startTimeRef.current = Date.now()
    hasTrackedRef.current = true

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId, userId, enabled])

  // Track view duration when component unmounts
  useEffect(() => {
    return () => {
      if (!enabled || !contentId || !hasTrackedRef.current) return

      const viewDuration = Math.floor((Date.now() - startTimeRef.current) / 1000)

      // Only track if viewed for at least 5 seconds
      if (viewDuration >= 5) {
        trackContentView({
          contentId,
          userId,
          viewDuration,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId, userId, enabled])
}
