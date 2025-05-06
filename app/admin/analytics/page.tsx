import { Suspense } from "react"
import {
  getOverviewMetrics,
  getDailyViews,
  getDailyRevenue,
  getTopContent,
  getEngagementByType,
} from "@/lib/analytics/queries"
import { OverviewMetrics } from "@/components/analytics/overview-metrics"
import { ViewsChart } from "@/components/analytics/views-chart"
import { RevenueChart } from "@/components/analytics/revenue-chart"
import { ContentPerformanceTable } from "@/components/analytics/content-performance-table"
import { EngagementMetrics } from "@/components/analytics/engagement-metrics"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// Loading components
function MetricsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-1" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartLoading() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <Skeleton className="h-5 w-40 mb-1" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent className="h-[300px]">
        <Skeleton className="h-full w-full" />
      </CardContent>
    </Card>
  )
}

function TableLoading() {
  return (
    <Card className="col-span-6">
      <CardHeader>
        <Skeleton className="h-5 w-40 mb-1" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  )
}

// Analytics dashboard components
async function AnalyticsOverview() {
  const metrics = await getOverviewMetrics()
  return <OverviewMetrics metrics={metrics} />
}

async function ViewsAnalytics() {
  const data = await getDailyViews()
  return <ViewsChart data={data} />
}

async function RevenueAnalytics() {
  const data = await getDailyRevenue()
  return <RevenueChart data={data} />
}

async function ContentAnalytics() {
  const data = await getTopContent()
  return <ContentPerformanceTable data={data} />
}

async function EngagementAnalytics() {
  const data = await getEngagementByType()
  return <EngagementMetrics data={data} />
}

export default function AnalyticsDashboard() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
      <p className="text-muted-foreground mb-8">Track platform performance, content engagement, and revenue</p>

      <div className="space-y-8">
        {/* Overview Metrics */}
        <Suspense fallback={<MetricsLoading />}>
          <AnalyticsOverview />
        </Suspense>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-8">
          <Suspense fallback={<ChartLoading />}>
            <ViewsAnalytics />
          </Suspense>

          <Suspense fallback={<ChartLoading />}>
            <RevenueAnalytics />
          </Suspense>
        </div>

        {/* Content Performance */}
        <div className="grid gap-4 md:grid-cols-8">
          <Suspense fallback={<TableLoading />}>
            <ContentAnalytics />
          </Suspense>

          <Suspense fallback={<ChartLoading />}>
            <EngagementAnalytics />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
