"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"

export default function HealthCheckPage() {
  const [healthData, setHealthData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchHealthData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setHealthData(data)
    } catch (err) {
      setError("Failed to fetch health data")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
  }, [])

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Health</h1>
          <p className="text-muted-foreground">Check the status of all services</p>
        </div>
        <Button onClick={fetchHealthData} variant="outline" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && !error ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        healthData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Overall Status:{" "}
                  <span className={`ml-2 ${healthData.status === "ok" ? "text-green-500" : "text-amber-500"}`}>
                    {healthData.status === "ok" ? "Healthy" : "Degraded"}
                  </span>
                </CardTitle>
                <CardDescription>Last checked: {new Date(healthData.timestamp).toLocaleString()}</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(healthData.services).map(([serviceName, serviceData]) => (
                <Card key={serviceName}>
                  <CardHeader>
                    <CardTitle className="capitalize">{serviceName}</CardTitle>
                    <CardDescription>Service status and details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-2">
                      <span className="font-semibold mr-2">Status:</span>
                      <span
                        className={`flex items-center ${
                          serviceData.status === "ok" ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {serviceData.status === "ok" ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" /> Operational
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 mr-1" /> Error
                          </>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold mr-2">Message:</span>
                      <span>{serviceData.message || "No message"}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-4">
          <a href="/admin" className="text-primary hover:underline">
            Back to Admin Dashboard
          </a>
          <a href="/admin/seed-database" className="text-primary hover:underline">
            Seed Database
          </a>
          <a href="/admin/analytics" className="text-primary hover:underline">
            Analytics Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
