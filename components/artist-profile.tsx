import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SuiIcon } from "@/components/sui-icon"
import { Check, Star, Calendar, MapPin, Music, MessageSquare } from "lucide-react"

interface ArtistProfileProps {
  artist: {
    id: string
    name: string
    image: string
    cover?: string
    genre: string
    rating: number
    bookingFee: string
    availability: string
    location: string
    verified: boolean
    bio?: string
    socialLinks?: { platform: string; url: string }[]
    upcomingEvents?: { title: string; date: string; location: string }[]
    content?: { id: string; title: string; type: string; cover: string }[]
  }
}

export function ArtistProfile({ artist }: ArtistProfileProps) {
  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary/20 to-primary/40 rounded-xl overflow-hidden">
          {artist.cover && (
            <Image
              src={artist.cover || "/placeholder.svg"}
              alt={`${artist.name} cover`}
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="absolute -bottom-16 left-4 md:left-8">
          <div className="relative h-32 w-32 rounded-full border-4 border-background overflow-hidden">
            <Image src={artist.image || "/placeholder.svg"} alt={artist.name} fill className="object-cover" />
          </div>
        </div>
        <div className="absolute top-4 right-4">
          {artist.verified && (
            <Badge variant="secondary" className="flex gap-1 items-center">
              <Check className="h-3 w-3" />
              Verified Artist
            </Badge>
          )}
        </div>
      </div>

      <div className="pt-16 md:pt-12 md:flex md:justify-between md:items-end">
        <div>
          <h1 className="text-3xl font-bold">{artist.name}</h1>
          <div className="flex flex-wrap gap-3 mt-2">
            <div className="flex items-center gap-1 text-sm">
              <Music className="h-4 w-4 text-muted-foreground" />
              <span>{artist.genre}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{artist.location}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{artist.rating}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button>Book Now</Button>
          <Button variant="outline" size="icon">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="about">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        <TabsContent value="about" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Biography</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{artist.bio || "No biography available for this artist."}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Booking Fee</div>
                  <div className="flex items-center gap-1 font-bold mt-1">
                    <SuiIcon className="h-4 w-4" />
                    <span>{artist.bookingFee}</span>
                  </div>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Availability</div>
                  <div className="font-bold mt-1">{artist.availability}</div>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Response Time</div>
                  <div className="font-bold mt-1">Within 24 hours</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {artist.content?.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src={item.cover || "/placeholder.svg"}
                      alt={item.title}
                      width={400}
                      height={400}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-background/90 text-foreground px-2 py-1 text-xs rounded-md uppercase">
                      {item.type}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{item.title}</h3>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No content available from this artist yet.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <div className="space-y-4">
            {artist.upcomingEvents?.map((event, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-bold">{event.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <Button>Get Tickets</Button>
                </CardContent>
              </Card>
            )) || <div className="text-center py-8 text-muted-foreground">No upcoming events for this artist.</div>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
