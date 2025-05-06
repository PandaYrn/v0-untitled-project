"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface RevenueChartProps {
  data: Array<{
    date: string
    revenue: number
    transactions: number
  }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Format the data for the chart
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: Number(item.revenue),
    transactions: Number(item.transactions),
  }))

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
        <CardDescription>Daily revenue and transactions</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
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
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue (SUI)" />
            <Bar yAxisId="right" dataKey="transactions" fill="#82ca9d" name="Transactions" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
