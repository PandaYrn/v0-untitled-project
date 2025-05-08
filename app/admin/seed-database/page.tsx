"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function SeedDatabasePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSeedDatabase = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/admin/seed-database", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to seed database")
      }

      setResult(data)
    } catch (err) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
          <CardDescription>
            Populate your database with sample data for testing and development purposes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This will create sample profiles, content, NFTs, events, comments, and genres in your database. Use this to
            quickly set up your SoundWave platform for testing.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">Success</AlertTitle>
              <AlertDescription>
                <p className="text-green-600">{result.message}</p>
                {result.stats && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>Profiles: {result.stats.profiles}</div>
                    <div>Content: {result.stats.content}</div>
                    <div>NFTs: {result.stats.nfts}</div>
                    <div>Events: {result.stats.events}</div>
                    <div>Comments: {result.stats.comments}</div>
                    <div>Genres: {result.stats.genres}</div>
                    {result.stats.contentGenres && <div>Content-Genre Links: {result.stats.contentGenres}</div>}
                    {result.stats.followers && <div>Followers: {result.stats.followers}</div>}
                    {result.stats.playlists && <div>Playlists: {result.stats.playlists}</div>}
                    {result.stats.playlistItems && <div>Playlist Items: {result.stats.playlistItems}</div>}
                    {result.stats.purchases && <div>Purchases: {result.stats.purchases}</div>}
                    {result.stats.blockchainTransactions && (
                      <div>Blockchain Transactions: {result.stats.blockchainTransactions}</div>
                    )}
                    {result.stats.royaltyPayments && <div>Royalty Payments: {result.stats.royaltyPayments}</div>}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSeedDatabase} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Database...
              </>
            ) : (
              "Seed Database"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
