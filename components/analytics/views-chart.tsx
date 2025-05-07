"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function ViewsChart({ data }) {
  // Ensure data is an array and handle undefined values
  const safeData = Array.isArray(data) ? data : []

  // Add default data if empty
  const chartData =
    safeData.length > 0
      ? safeData
      : [
          { date: "2023-01-01", views: 0 },
          { date: "2023-01-02", views: 0 },
        ]

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Content Views</CardTitle>
        <CardDescription>Daily view count for the last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                try {
                  const date = new Date(value)
                  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                } catch (e) {
                  return value
                }
              }}
            />
            <YAxis />
            <Tooltip
              formatter={(value) => [Number(value).toLocaleString(), "Views"]}
              labelFormatter={(label) => {
                try {
                  const date = new Date(label)
                  return date.toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                } catch (e) {
                  return label
                }
              }}
            />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
