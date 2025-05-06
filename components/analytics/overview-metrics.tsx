"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, DollarSign, Eye, Heart } from "lucide-react"

interface OverviewMetricsProps {
  metrics: {
    total_views: number
    viewed_content: number
    unique_viewers: number
    avg_duration: number
    total_transactions: number
    total_revenue: number
    avg_transaction: number
    total_engagements: number
    engaged_users: number
  }
}

export function OverviewMetrics({ metrics }: OverviewMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.total_views.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{metrics.unique_viewers.toLocaleString()} unique viewers</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.total_revenue
              ? metrics.total_revenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0.00"}{" "}
            SUI
          </div>
          <p className="text-xs text-muted-foreground">{metrics.total_transactions.toLocaleString()} transactions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Engagement</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.total_engagements.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{metrics.engaged_users.toLocaleString()} engaged users</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Content</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.viewed_content.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{Math.round(metrics.avg_duration || 0)} sec avg. duration</p>
        </CardContent>
      </Card>
    </div>
  )
}
