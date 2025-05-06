"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"

interface ContentPerformanceProps {
  data: Array<{
    content_id: string
    views: number
    unique_viewers: number
    avg_duration: number
    revenue: number
    transactions: number
    engagements: number
  }>
}

export function ContentPerformanceTable({ data }: ContentPerformanceProps) {
  const [contentDetails, setContentDetails] = useState<Record<string, { title: string; type: string }>>({})

  // Fetch content details
  useEffect(() => {
    async function fetchContentDetails() {
      try {
        const contentIds = data.map((item) => item.content_id)

        const response = await fetch("/api/content/details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ contentIds }),
        })

        const result = await response.json()

        if (result.success && result.data) {
          const detailsMap: Record<string, { title: string; type: string }> = {}

          result.data.forEach((item: any) => {
            detailsMap[item.id] = {
              title: item.title,
              type: item.content_type,
            }
          })

          setContentDetails(detailsMap)
        }
      } catch (error) {
        console.error("Error fetching content details:", error)
      }
    }

    if (data.length > 0) {
      fetchContentDetails()
    }
  }, [data])

  return (
    <Card className="col-span-6">
      <CardHeader>
        <CardTitle>Top Performing Content</CardTitle>
        <CardDescription>Content with the most views, engagement, and revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Avg. Duration</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Engagements</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.content_id}>
                <TableCell className="font-medium">
                  {contentDetails[item.content_id]?.title || item.content_id.substring(0, 8)}
                </TableCell>
                <TableCell>{contentDetails[item.content_id]?.type || "Unknown"}</TableCell>
                <TableCell className="text-right">{item.views.toLocaleString()}</TableCell>
                <TableCell className="text-right">{Math.round(item.avg_duration || 0)} sec</TableCell>
                <TableCell className="text-right">
                  {item.revenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  SUI
                </TableCell>
                <TableCell className="text-right">{item.engagements.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
