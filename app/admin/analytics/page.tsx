import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
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

// Force dynamic rendering to avoid static generation errors
export const dynamic = "force-dynamic"
export const revalidate = 0

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

// Error component
function ErrorDisplay({ message }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

// Analytics dashboard components with error handling
async function AnalyticsOverview() {
  try {
    const metrics = await getOverviewMetrics()
    return <OverviewMetrics metrics={metrics} />
  } catch (error) {
    console.error("Error in AnalyticsOverview:", error)
    return <ErrorDisplay message="Failed to load overview metrics" />
  }
}

async function ViewsAnalytics() {
  try {
    const data = await getDailyViews()
    return <ViewsChart data={data} />
  } catch (error) {
    console.error("Error in ViewsAnalytics:", error)
    return <ErrorDisplay message="Failed to load views chart" />
  }
}

async function RevenueAnalytics() {
  try {
    const data = await getDailyRevenue()
    return <RevenueChart data={data} />
  } catch (error) {
    console.error("Error in RevenueAnalytics:", error)
    return <ErrorDisplay message="Failed to load revenue chart" />
  }
}

async function ContentAnalytics() {
  try {
    const data = await getTopContent()
    return <ContentPerformanceTable data={data} />
  } catch (error) {
    console.error("Error in ContentAnalytics:", error)
    return <ErrorDisplay message="Failed to load content performance" />
  }
}

async function EngagementAnalytics() {
  try {
    const data = await getEngagementByType()
    return <EngagementMetrics data={data} />
  } catch (error) {
    console.error("Error in EngagementAnalytics:", error)
    return <ErrorDisplay message="Failed to load engagement metrics" />
  }
}

export default function AnalyticsDashboard() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
      <p className="text-muted-foreground mb-8">Track platform performance, content engagement, and revenue</p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Database Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            To use the analytics dashboard, make sure you have set up the Neon PostgreSQL database and added the correct
            environment variables. You can seed the database with sample data from the admin panel.
          </p>
          <div className="mt-4">
            <a href="/admin/seed-analytics" className="text-primary hover:underline">
              Go to Database Seeding Page
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <Suspense fallback={<MetricsLoading />}>
          <AnalyticsOverview />
        </Suspense>

        <div className="grid gap-4 md:grid-cols-8">
          <Suspense fallback={<ChartLoading />}>
            <ViewsAnalytics />
          </Suspense>

          <Suspense fallback={<ChartLoading />}>
            <RevenueAnalytics />
          </Suspense>
        </div>

        <div className="grid gap-4 md:grid-cols-8">
          <Suspense fallback={<ChartLoading />}>
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
