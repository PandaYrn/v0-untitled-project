import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Check, Clock, MapPin, MessageSquare, Music, Star, Users } from "lucide-react"

export default function BookingPage() {
  // This would come from blockchain/API in a real implementation
  const artists = [
    {
      id: "1",
      name: "Aurora Nights",
      image: "/placeholder.svg?height=400&width=400",
      genre: "Electronic",
      rating: 4.9,
      bookingFee: "5 SUI",
      availability: "Available",
      location: "Virtual / Worldwide",
      verified: true,
    },
    {
      id: "2",
      name: "Crypto Collective",
      image: "/placeholder.svg?height=400&width=400",
      genre: "Hip Hop / Electronic",
      rating: 4.7,
      bookingFee: "8 SUI",
      availability: "Limited",
      location: "New York / Los Angeles",
      verified: true,
    },
    {
      id: "3",
      name: "Block Producers",
      image: "/placeholder.svg?height=400&width=400",
      genre: "EDM",
      rating: 4.5,
      bookingFee: "3 SUI",
      availability: "Available",
      location: "Miami / Virtual",
      verified: false,
    },
    {
      id: "4",
      name: "Virtual Virtuosos",
      image: "/placeholder.svg?height=400&width=400",
      genre: "Classical Fusion",
      rating: 4.8,
      bookingFee: "7 SUI",
      availability: "Available",
      location: "London / Virtual",
      verified: true,
    },
  ]

  return (
    <main className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Book Artists</h1>
          <p className="text-muted-foreground">Secure and transparent booking with smart contracts</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Genre</label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option value="all">All Genres</option>
                    <option value="electronic">Electronic</option>
                    <option value="hiphop">Hip Hop</option>
                    <option value="classical">Classical</option>
                    <option value="rock">Rock</option>
                    <option value="jazz">Jazz</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option value="all">All Locations</option>
                    <option value="virtual">Virtual Only</option>
                    <option value="nyc">New York</option>
                    <option value="la">Los Angeles</option>
                    <option value="miami">Miami</option>
                    <option value="london">London</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range</label>
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder="Min" />
                    <span>to</span>
                    <Input type="number" placeholder="Max" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Availability</label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option value="all">All</option>
                    <option value="available">Available</option>
                    <option value="limited">Limited</option>
                  </select>
                </div>

                <div className="pt-2">
                  <Button className="w-full">Apply Filters</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recently Viewed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Image
                    src="/placeholder.svg?height=50&width=50"
                    alt="Artist"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-medium">Aurora Nights</div>
                    <div className="text-xs text-muted-foreground">Electronic</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Image
                    src="/placeholder.svg?height=50&width=50"
                    alt="Artist"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-medium">Block Producers</div>
                    <div className="text-xs text-muted-foreground">EDM</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-3/4 space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">Showing {artists.length} artists</div>
              <select className="rounded-md border border-input bg-background px-3 py-2">
                <option value="rating">Sort by: Rating</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {artists.map((artist) => (
                <Card key={artist.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="md:flex">
                      <div className="relative md:w-1/3">
                        <Image
                          src={artist.image || "/placeholder.svg"}
                          alt={artist.name}
                          width={200}
                          height={200}
                          className="object-cover h-full w-full aspect-square"
                        />
                        <div className="absolute top-2 right-2">
                          {artist.verified && (
                            <Badge variant="secondary" className="flex gap-1 items-center">
                              <Check className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="p-4 md:w-2/3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{artist.name}</h3>
                            <div className="flex items-center gap-1 text-sm">
                              <Music className="h-3 w-3 text-muted-foreground" />
                              <span>{artist.genre}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span>{artist.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold">{artist.rating}</span>
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>Availability:</span>
                            </div>
                            <Badge variant={artist.availability === "Available" ? "outline" : "secondary"}>
                              {artist.availability}
                            </Badge>
                          </div>

                          <div className="flex justify-between">
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>Response time:</span>
                            </div>
                            <span className="text-sm">Within 24 hours</span>
                          </div>

                          <div className="flex justify-between">
                            <div className="flex items-center gap-1 text-sm">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              <span>Booking fee:</span>
                            </div>
                            <span className="font-bold text-sm">{artist.bookingFee}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button asChild className="flex-1">
                            <Link href={`/booking/${artist.id}`}>Book Now</Link>
                          </Button>
                          <Button variant="outline" size="icon">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <Button variant="outline">Load More</Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
