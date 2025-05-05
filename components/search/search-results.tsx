"use client"

import { useState, useEffect } from "react"
import { ContentCard } from "@/components/content/content-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getBrowserSupabaseClient } from "@/lib/supabase/client"
import { Calendar, Clock, Loader2, MapPin, Music, Search, Ticket } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function SearchResults({ initialQuery }) {
  const [query, setQuery] = useState(initialQuery || "")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState({
    content: [],
    profiles: [],
    events: [],
  })
  const [activeTab, setActiveTab] = useState("all")

  const supabase = getBrowserSupabaseClient()

  useEffect(() => {
    if (query) {
      performSearch(query)
    } else {
      setResults({
        content: [],
        profiles: [],
        events: [],
      })
    }
  }, [query])

  const performSearch = async (searchQuery) => {
    setLoading(true)

    try {
      // Search content
      const { data: contentResults } = await supabase
        .from("content")
        .select(`
          *,
          profiles:creator_id(*)
        `)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(20)

      // Search profiles
      const { data: profileResults } = await supabase
        .from("profiles")
        .select(`
          *,
          artist_profiles(*)
        `)
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`)
        .limit(20)

      // Search events
      const { data: eventResults } = await supabase
        .from("events")
        .select(`
          *,
          organizer:organizer_id(*)
        `)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,venue.ilike.%${searchQuery}%`)
        .limit(20)

      setResults({
        content: contentResults || [],
        profiles: profileResults || [],
        events: eventResults || [],
      })
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Update query when initialQuery changes (from URL)
  useEffect(() => {
    if (initialQuery !== query) {
      setQuery(initialQuery || "")
    }
  }, [initialQuery])

  const totalResults = results.content.length + results.profiles.length + results.events.length

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : query && totalResults === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">No Results Found</h3>
            <p className="text-muted-foreground text-center max-w-md mt-2">
              We couldn't find any matches for "{query}". Try different keywords or browse categories.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      ) : query ? (
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2">
                {totalResults}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="content">
              Content
              <Badge variant="secondary" className="ml-2">
                {results.content.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="profiles">
              Artists
              <Badge variant="secondary" className="ml-2">
                {results.profiles.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="events">
              Events
              <Badge variant="secondary" className="ml-2">
                {results.events.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-8">
            {results.content.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Content</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {results.content.slice(0, 4).map((item) => (
                    <ContentCard key={item.id} content={item} />
                  ))}
                </div>
                {results.content.length > 4 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => setActiveTab("content")}>
                      View All Content Results
                    </Button>
                  </div>
                )}
              </div>
            )}

            {results.profiles.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Artists & Profiles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {results.profiles.slice(0, 4).map((profile) => (
                    <Card key={profile.id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-4">
                            <Image
                              src={profile.avatar_url || "/placeholder.svg?height=100&width=100"}
                              alt={profile.username}
                              width={100}
                              height={100}
                              className="rounded-full"
                            />
                            {profile.is_artist && (
                              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                                <Music className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-bold">{profile.full_name || profile.username}</h3>
                          {profile.bio && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{profile.bio}</p>
                          )}
                          <Button variant="outline" size="sm" className="mt-4" asChild>
                            <Link href={`/profile/${profile.id}`}>View Profile</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {results.profiles.length > 4 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => setActiveTab("profiles")}>
                      View All Artist Results
                    </Button>
                  </div>
                )}
              </div>
            )}

            {results.events.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.events.slice(0, 2).map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                      <div className="relative">
                        <Image
                          src={event.cover_url || "/placeholder.svg?height=400&width=600"}
                          alt={event.title}
                          width={600}
                          height={300}
                          className="w-full object-cover h-48"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle>{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(event.event_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{event.venue}</span>
                          </div>
                        </div>
                        <Button asChild className="w-full">
                          <Link href={`/tickets/${event.id}`}>View Event</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {results.events.length > 2 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => setActiveTab("events")}>
                      View All Event Results
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {results.content.map((item) => (
                <ContentCard key={item.id} content={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profiles" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {results.profiles.map((profile) => (
                <Card key={profile.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <Image
                          src={profile.avatar_url || "/placeholder.svg?height=100&width=100"}
                          alt={profile.username}
                          width={100}
                          height={100}
                          className="rounded-full"
                        />
                        {profile.is_artist && (
                          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                            <Music className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold">{profile.full_name || profile.username}</h3>
                      {profile.bio && <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>}
                      {profile.is_artist && profile.artist_profiles && (
                        <div className="mt-2 flex flex-wrap gap-1 justify-center">
                          {profile.artist_profiles.genre?.split(",").map((genre, i) => (
                            <Badge key={i} variant="outline">
                              {genre.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Button variant="outline" size="sm" className="mt-4" asChild>
                        <Link href={`/profile/${profile.id}`}>View Profile</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="relative">
                    <Image
                      src={event.cover_url || "/placeholder.svg?height=400&width=600"}
                      alt={event.title}
                      width={600}
                      height={300}
                      className="w-full object-cover h-48"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground line-clamp-2">{event.description}</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(event.event_date).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {event.available_tickets} of {event.total_tickets} tickets available
                        </span>
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/tickets/${event.id}`}>View Event</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">Search for Content, Artists, or Events</h3>
            <p className="text-muted-foreground text-center max-w-md mt-2">
              Enter keywords to find music, movies, artists, or upcoming events.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
