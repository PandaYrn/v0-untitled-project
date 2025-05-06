"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function SeedAnalyticsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const handleSeedData = async () => {
    try {
      setLoading(true)
      setResult(null)

      const response = await fetch("/api/admin/seed-analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Seed Analytics Data</h1>
      <p className="text-muted-foreground mb-8">Generate sample analytics data for testing and development</p>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Generate Sample Data</CardTitle>
          <CardDescription>
            This will create sample analytics data including content views, user engagement, and transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">The seeding process will:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>Generate 1,000 content view records</li>
            <li>Create 500 user engagement events</li>
            <li>Add 200 transaction records</li>
          </ul>

          {result && (
            <Alert className="mt-6" variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message || result.error || "An unknown error occurred"}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSeedData} disabled={loading} className="w-full">
            {loading ? "Generating Data..." : "Generate Sample Data"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
