import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BarChart, DollarSign, Activity } from "lucide-react"

export function OverviewMetrics({ metrics }) {
  // Ensure metrics is an object with default values
  const safeMetrics = metrics || {}

  // Format numbers with commas and handle undefined values
  const formatNumber = (value) => {
    if (value === undefined || value === null) return "0"
    return Number(value).toLocaleString()
  }

  // Format currency with $ and handle undefined values
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "$0.00"
    return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(safeMetrics.total_views)}</div>
          <p className="text-xs text-muted-foreground">{formatNumber(safeMetrics.unique_viewers)} unique viewers</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(safeMetrics.total_revenue)}</div>
          <p className="text-xs text-muted-foreground">{formatNumber(safeMetrics.transaction_count)} transactions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Engagements</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(safeMetrics.total_engagements)}</div>
          <p className="text-xs text-muted-foreground">User interactions with content</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(safeMetrics.engaged_users)}</div>
          <p className="text-xs text-muted-foreground">Users who engaged with content</p>
        </CardContent>
      </Card>
    </div>
  )
}
