"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ContentPerformanceTable({ data }) {
  // Ensure data is an array and handle undefined values
  const safeData = Array.isArray(data) ? data : []

  // Format numbers with commas
  const formatNumber = (value) => {
    if (value === undefined || value === null) return "0"
    return Number(value).toLocaleString()
  }

  // Format currency with $
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "$0.00"
    return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <Card className="col-span-6">
      <CardHeader>
        <CardTitle>Content Performance</CardTitle>
        <CardDescription>Top performing content by views, revenue, and engagement</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content ID</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Unique Viewers</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Engagements</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeData.length > 0 ? (
              safeData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.content_id || "Unknown"}</TableCell>
                  <TableCell className="text-right">{formatNumber(item.views)}</TableCell>
                  <TableCell className="text-right">{formatNumber(item.unique_viewers)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                  <TableCell className="text-right">{formatNumber(item.engagements)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
