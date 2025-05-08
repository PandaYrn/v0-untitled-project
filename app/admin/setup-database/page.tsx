"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SetupDatabasePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    error?: string
  } | null>(null)

  const handleSetupDatabase = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/setup-database", {
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
      <h1 className="text-3xl font-bold mb-2">Database Setup</h1>
      <p className="text-muted-foreground mb-8">Create the necessary database schema for your SoundWave platform</p>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Setup Database Schema</CardTitle>
          <CardDescription>
            This will create all the necessary tables in your database for the SoundWave platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Use this tool to set up your database schema. This is the first step in getting your SoundWave platform up
              and running.
            </p>
            <p className="text-sm text-muted-foreground">
              Note: This will not delete any existing data. It will only create tables if they don't already exist.
            </p>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{result.success ? result.message : result.error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSetupDatabase} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting Up Database...
              </>
            ) : (
              "Setup Database"
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/admin/seed-database" className="text-primary hover:underline">
              Seed Database
            </Link>{" "}
            - Populate your database with sample data
          </li>
          <li>
            <Link href="/admin/seed-analytics" className="text-primary hover:underline">
              Seed Analytics Data
            </Link>{" "}
            - Generate sample analytics data
          </li>
          <li>
            <Link href="/admin/health" className="text-primary hover:underline">
              Check System Health
            </Link>{" "}
            - Verify all services are working correctly
          </li>
          <li>
            <Link href="/" className="text-primary hover:underline">
              Go to Homepage
            </Link>{" "}
            - View the main website
          </li>
        </ul>
      </div>
    </div>
  )
}
