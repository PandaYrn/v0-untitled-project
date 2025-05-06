"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface EngagementMetricsProps {
  data: Array<{
    event_type: string
    count: number
  }>
}

export function EngagementMetrics({ data }: EngagementMetricsProps) {
  // Colors for the pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658"]

  // Format the data for the chart
  const chartData = data.map((item, index) => ({
    name: item.event_type.charAt(0).toUpperCase() + item.event_type.slice(1).replace("_", " "),
    value: Number(item.count),
    color: COLORS[index % COLORS.length],
  }))

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Engagement Types</CardTitle>
        <CardDescription>Distribution of user engagement actions</CardDescription>
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
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} actions`, "Count"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
