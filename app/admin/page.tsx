import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, BarChart3, Play, Users, FileText } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Database Management
            </CardTitle>
            <CardDescription>Manage your database and sample data</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Seed your database with sample data or view the current database structure.</p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin/seed-database">Seed Database</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>View and manage analytics data</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Generate sample analytics data or view analytics dashboard.</p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin/seed-analytics">Seed Analytics</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/analytics">View Analytics</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="mr-2 h-5 w-5" />
              Quick Start
            </CardTitle>
            <CardDescription>Get your platform up and running</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Follow the quick start guide to set up your SoundWave platform.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/admin/quickstart">Quick Start Guide</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>Manage users and profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <p>View and manage user accounts and artist profiles.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Content Management
            </CardTitle>
            <CardDescription>Manage music, movies, and other content</CardDescription>
          </CardHeader>
          <CardContent>
            <p>View, edit, and manage all content on your platform.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/content">Manage Content</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
