import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, MapPin, Ticket, Users, Wallet, Check } from "lucide-react"
import { SuiIcon } from "@/components/sui-icon"

export default function TicketsPage() {
  // This would come from blockchain/API in a real implementation
  const events = [
    {
      id: "1",
      title: "Blockchain Beats Live",
      artist: "Crypto Collective",
      image: "/placeholder.svg?height=400&width=400",
      date: "April 15, 2025",
      time: "8:00 PM",
      location: "Crypto Arena, Los Angeles",
      price: "1.5 SUI",
      remaining: 45,
      total: 500,
      nft: true,
    },
    {
      id: "2",
      title: "Metaverse Music Festival",
      artist: "Various Artists",
      image: "/placeholder.svg?height=400&width=400",
      date: "May 5-7, 2025",
      time: "All day",
      location: "Virtual",
      price: "0.75 SUI",
      remaining: 1500,
      total: 5000,
      nft: true,
    },
    {
      id: "3",
      title: "Aurora Nights: Ethereal Tour",
      artist: "Aurora Nights",
      image: "/placeholder.svg?height=400&width=400",
      date: "June 12, 2025",
      time: "7:30 PM",
      location: "Decentralized Dome, Miami",
      price: "2 SUI",
      remaining: 120,
      total: 800,
      nft: true,
    },
    {
      id: "4",
      title: "Block Producers Summer Jam",
      artist: "Block Producers",
      image: "/placeholder.svg?height=400&width=400",
      date: "July 4, 2025",
      time: "6:00 PM",
      location: "Token Stadium, New York",
      price: "1.2 SUI",
      remaining: 350,
      total: 1200,
      nft: true,
    },
  ]

  const myTickets = [
    {
      id: "ticket1",
      title: "Harmony in Web3",
      artist: "Virtual Virtuosos",
      image: "/placeholder.svg?height=400&width=400",
      date: "March 30, 2025",
      time: "8:00 PM",
      location: "Crypto Center, San Francisco",
      tokenId: "0x7a94...2f38",
      ticketType: "VIP",
    },
  ]

  return (
    <main className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Concert Tickets</h1>
          <p className="text-muted-foreground">NFT tickets with blockchain-verified authenticity and transferability</p>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="mytickets">My Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="relative">
                    <Image
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      width={600}
                      height={300}
                      className="w-full object-cover h-48"
                    />
                    <div className="absolute top-2 right-2">
                      {event.nft && (
                        <Badge variant="secondary" className="flex gap-1 items-center">
                          <SuiIcon className="h-3 w-3" />
                          NFT Ticket
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <p className="text-muted-foreground">{event.artist}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {event.remaining} of {event.total} remaining
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <SuiIcon className="h-4 w-4" />
                        <span className="font-bold">{event.price}</span>
                      </div>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${100 - (event.remaining / event.total) * 100}%` }}
                      ></div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/tickets/${event.id}`}>Purchase Tickets</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <Button variant="outline">Load More Events</Button>
            </div>
          </TabsContent>

          <TabsContent value="mytickets" className="mt-6 space-y-6">
            {myTickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myTickets.map((ticket) => (
                  <Card key={ticket.id} className="overflow-hidden">
                    <div className="relative">
                      <Image
                        src={ticket.image || "/placeholder.svg"}
                        alt={ticket.title}
                        width={600}
                        height={300}
                        className="w-full object-cover h-48"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-primary">{ticket.ticketType}</Badge>
                      </div>
                    </div>

                    <CardHeader>
                      <CardTitle>{ticket.title}</CardTitle>
                      <p className="text-muted-foreground">{ticket.artist}</p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{ticket.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{ticket.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{ticket.location}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-md">
                        <div className="text-xs text-muted-foreground">NFT Token ID</div>
                        <div className="font-mono text-sm">{ticket.tokenId}</div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex gap-2">
                      <Button className="flex-1">View Ticket</Button>
                      <Button variant="outline" className="flex-1">
                        Transfer
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold">No Tickets Found</h3>
                  <p className="text-muted-foreground text-center max-w-md mt-2">
                    You haven't purchased any tickets yet. Browse upcoming events to find your next experience.
                  </p>
                  <Button className="mt-6" asChild>
                    <Link href="/tickets?tab=upcoming">Explore Events</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-16 bg-secondary/20 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Why NFT Tickets?</h2>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="bg-primary rounded-full p-1 mt-1">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">Verified Authenticity</h3>
                  <p className="text-muted-foreground">Blockchain verification prevents counterfeiting and fraud.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary rounded-full p-1 mt-1">
                  <Users className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">Secure Transfer</h3>
                  <p className="text-muted-foreground">Safely resell or transfer tickets through the marketplace.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary rounded-full p-1 mt-1">
                  <Wallet className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">Fair Revenue Distribution</h3>
                  <p className="text-muted-foreground">
                    Smart contracts ensure artists receive royalties from resales.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt="NFT Ticket Example"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </main>
  )
}
