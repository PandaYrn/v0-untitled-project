"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ViewsChartProps {
  data: Array<{
    date: string
    views: number
    unique_viewers: number
  }>
}

export function ViewsChart({ data }: ViewsChartProps) {
  // Format the data for the chart
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    views: Number(item.views),
    unique_viewers: Number(item.unique_viewers),
  }))

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Content Views</CardTitle>
        <CardDescription>Daily view trends over time</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="views" stroke="#8884d8" activeDot={{ r: 8 }} name="Total Views" />
            <Line type="monotone" dataKey="unique_viewers" stroke="#82ca9d" name="Unique Viewers" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
