"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function SeedDatabasePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    error?: string
    stats?: any
  } | null>(null)

  const handleSeedDatabase = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/seed-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Database Seeding</h1>
      <p className="text-muted-foreground mb-8">Populate your database with sample data for testing and development</p>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
          <CardDescription>
            This will create sample users, profiles, content, NFTs, events, and transactions in your database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Use this tool to quickly populate your database with sample data. This is useful for testing and
              development purposes.
            </p>
            <p className="text-sm text-muted-foreground">
              Note: This will not overwrite existing data with the same IDs. It will only add new data or update
              existing data.
            </p>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>
                  {result.success ? result.message : result.error}
                  {result.success && result.stats && (
                    <div className="mt-2">
                      <p className="font-semibold">Created/Updated:</p>
                      <ul className="list-disc list-inside">
                        <li>Users: {result.stats.users}</li>
                        <li>Profiles: {result.stats.profiles}</li>
                        <li>Content: {result.stats.content}</li>
                        <li>NFTs: {result.stats.nfts}</li>
                        <li>Events: {result.stats.events}</li>
                        <li>Comments: {result.stats.comments}</li>
                        <li>Transactions: {result.stats.transactions}</li>
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSeedDatabase} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Seeding Database...
              </>
            ) : (
              "Seed Database"
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        <ul className="space-y-2">
          <li>
            <a href="/admin/analytics" className="text-primary hover:underline">
              Go to Analytics Dashboard
            </a>{" "}
            - View platform metrics and performance data
          </li>
          <li>
            <a href="/admin/seed-analytics" className="text-primary hover:underline">
              Seed Analytics Data
            </a>{" "}
            - Generate sample analytics data
          </li>
          <li>
            <a href="/" className="text-primary hover:underline">
              Go to Homepage
            </a>{" "}
            - View the main website
          </li>
        </ul>
      </div>
    </div>
  )
}
