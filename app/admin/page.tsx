import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminDashboard() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Manage your SoundWave platform</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Database Management</CardTitle>
            <CardDescription>Seed and manage your database</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Populate your database with sample data for testing and development. This includes users, content, NFTs,
              events, and more.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/seed-database" className="w-full">
              <Button className="w-full">Seed Database</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>View platform metrics and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Track user engagement, content performance, revenue, and other key metrics to understand your platform's
              growth.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/analytics" className="w-full">
              <Button className="w-full">View Analytics</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Check the status of all services</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Monitor the health and status of all connected services including Supabase, Neon database, and other
              integrations.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/health" className="w-full">
              <Button className="w-full">Check Health</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics Data</CardTitle>
            <CardDescription>Generate sample analytics data</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Populate your analytics database with sample data for testing and development. This includes views,
              engagements, and transactions.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/seed-analytics" className="w-full">
              <Button className="w-full">Seed Analytics</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/">
            <Button variant="outline">Homepage</Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="outline">Marketplace</Button>
          </Link>
          <Link href="/stream">
            <Button variant="outline">Streaming</Button>
          </Link>
          <Link href="/nfts">
            <Button variant="outline">NFTs</Button>
          </Link>
          <Link href="/tickets">
            <Button variant="outline">Tickets</Button>
          </Link>
          <Link href="/royalties">
            <Button variant="outline">Royalties</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
