"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function RevenueChart({ data }) {
  // Ensure data is an array and handle undefined values
  const safeData = Array.isArray(data) ? data : []

  // Add default data if empty
  const chartData =
    safeData.length > 0
      ? safeData
      : [
          { date: "2023-01-01", revenue: 0 },
          { date: "2023-01-02", revenue: 0 },
        ]

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
        <CardDescription>Daily revenue for the last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
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
              formatter={(value) => [
                `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                "Revenue",
              ]}
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
            <Bar dataKey="revenue" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
