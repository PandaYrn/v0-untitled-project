"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export function EngagementMetrics({ data }) {
  // Ensure data is an array and handle undefined values
  const safeData = Array.isArray(data) ? data : []

  // Add default data if empty
  const chartData = safeData.length > 0 ? safeData : [{ event_type: "No Data", count: 1 }]

  // Colors for the pie chart
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FFC658",
    "#8DD1E1",
    "#A4DE6C",
    "#D0ED57",
  ]

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Engagement Types</CardTitle>
        <CardDescription>Distribution of user engagement by type</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="event_type"
              label={({ event_type, count, percent }) => {
                const eventType = event_type || "Unknown"
                const formattedPercent = (percent * 100).toFixed(0)
                return formattedPercent > 5 ? `${eventType}: ${formattedPercent}%` : ""
              }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [Number(value).toLocaleString(), "Count"]}
              labelFormatter={(label) => label || "Unknown"}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
