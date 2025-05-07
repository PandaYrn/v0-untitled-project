import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewMetrics } from "@/components/analytics/overview-metrics"
import { ViewsChart } from "@/components/analytics/views-chart"
import { RevenueChart } from "@/components/analytics/revenue-chart"
import { ContentPerformanceTable } from "@/components/analytics/content-performance-table"
import { EngagementMetrics } from "@/components/analytics/engagement-metrics"
import { getOverviewMetrics, getDailyViews, getDailyRevenue, getTopContent, getEngagementByType } from "@/lib/analytics/queries"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AnalyticsDashboard() {
  // Fetch all data with error handling
  let overviewMetrics = { totalViews: 0, totalRevenue: 0, totalEngagements: 0, activeUsers: 0 }
  let dailyViews = []
  let dailyRevenue = []
  let topContent = []
  let engagementByType = []
  
  try {
    overviewMetrics = await getOverviewMetrics()
  } catch (error) {
    console.error("Error getting overview metrics:", error)
  }
  
  try {
    dailyViews = await getDailyViews()
  } catch (error) {
    console.error("Error getting daily views:", error)
  }
  
  try {
    dailyRevenue = await getDailyRevenue()
  } catch (error) {
    console.error("Error getting daily revenue:", error)
  }
  
  try {
    topContent = await getTopContent(10)
  } catch (error) {
    console.error("Error getting top content:", error)
  }
  
  try {
    engagementByType = await getEngagementByType()
  } catch (error) {
    console.error("Error getting engagement by type:", error)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <OverviewMetrics metrics={overviewMetrics} />
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Views</CardTitle>
                <CardDescription>Daily content views for the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ViewsChart data={dailyViews} />
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
                <CardDescription>Daily revenue for the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <RevenueChart data={dailyRevenue} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>Top performing content by views, revenue, and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <ContentPerformanceTable data={topContent} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Revenue by day for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <RevenueChart data={dailyRevenue} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>Breakdown of user engagement by type</CardDescription>
            </CardHeader>
            <CardContent>
              <EngagementMetrics data={engagementByType} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
