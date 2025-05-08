import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight } from "lucide-react"

export default function QuickStartGuidePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2">Quick Start Guide</h1>
      <p className="text-gray-500 mb-8">Follow these steps to get your SoundWave platform up and running</p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground mr-3">
                1
              </span>
              Seed the Database
            </CardTitle>
            <CardDescription>Populate your database with sample data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The first step is to populate your database with sample data. This will create profiles, content, NFTs,
              events, and more.
            </p>
            <div className="flex items-center">
              <Button asChild>
                <Link href="/admin/seed-database">
                  Seed Database
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <div className="ml-4 text-sm text-gray-500">Estimated time: 30 seconds</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground mr-3">
                2
              </span>
              Generate Analytics Data
            </CardTitle>
            <CardDescription>Create sample analytics data for testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Generate sample analytics data to test the analytics dashboard and reporting features.</p>
            <div className="flex items-center">
              <Button asChild>
                <Link href="/admin/seed-analytics">
                  Seed Analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <div className="ml-4 text-sm text-gray-500">Estimated time: 30 seconds</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground mr-3">
                3
              </span>
              Explore the Platform
            </CardTitle>
            <CardDescription>Browse the main features of your SoundWave platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Now that your database is populated, you can explore the main features of your platform.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button asChild variant="outline">
                <Link href="/">
                  Homepage
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/marketplace">
                  Marketplace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/stream">
                  Streaming
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/nfts">
                  NFTs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/tickets">
                  Tickets
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/royalties">
                  Royalties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground mr-3">
                4
              </span>
              View Analytics
            </CardTitle>
            <CardDescription>Check out the analytics dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>View the analytics dashboard to see insights about content views, revenue, and user engagement.</p>
            <div className="flex items-center">
              <Button asChild>
                <Link href="/admin/analytics">
                  View Analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground mr-3">
                5
              </span>
              Upload Your Own Content
            </CardTitle>
            <CardDescription>Start adding your own music and movies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Ready to add your own content? Use the content upload form to add your music, movies, and more.</p>
            <div className="flex items-center">
              <Button asChild>
                <Link href="/content/upload">
                  Upload Content
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-8">
          <Button asChild variant="outline" size="lg">
            <Link href="/admin">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Return to Admin Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
