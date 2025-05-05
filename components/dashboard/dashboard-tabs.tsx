"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContentCard } from "@/components/content/content-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SuiIcon } from "@/components/sui-icon"
import Image from "next/image"
import Link from "next/link"
import { Music, Ticket, Calendar, Clock, MapPin, Users, Wallet, ArrowUpRight, ShoppingCart, Plus } from "lucide-react"

export function DashboardTabs({ userContent, userPurchases, userNfts, userTickets, userBookings, userRoyalties }) {
  const [activeTab, setActiveTab] = useState("content")

  return (
    <Tabs defaultValue="content" onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 md:grid-cols-6">
        <TabsTrigger value="content">My Content</TabsTrigger>
        <TabsTrigger value="purchases">Purchases</TabsTrigger>
        <TabsTrigger value="nfts">NFTs</TabsTrigger>
        <TabsTrigger value="tickets">Tickets</TabsTrigger>
        <TabsTrigger value="bookings">Bookings</TabsTrigger>
        <TabsTrigger value="royalties">Royalties</TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Content</h2>
          <Button asChild>
            <Link href="/content/upload">
              <Plus className="h-4 w-4 mr-2" />
              Upload New
            </Link>
          </Button>
        </div>

        {userContent && userContent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userContent.map((item) => (
              <ContentCard key={item.id} content={item} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Music className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">No Content Yet</h3>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                You haven't uploaded any content yet. Start sharing your music or movies with the world.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/content/upload">Upload Content</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="purchases" className="mt-6">
        <h2 className="text-2xl font-bold mb-6">My Purchases</h2>

        {userPurchases && userPurchases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userPurchases.map((purchase) => (
              <ContentCard key={purchase.id} content={purchase.content} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3 mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">No Purchases Yet</h3>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                You haven't purchased any content yet. Explore the marketplace to find amazing music and movies.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/marketplace">Browse Marketplace</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="nfts" className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My NFTs</h2>
          <Button asChild>
            <Link href="/nfts/mint">
              <Plus className="h-4 w-4 mr-2" />
              Mint NFT
            </Link>
          </Button>
        </div>

        {userNfts && userNfts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {userNfts.map((nft) => (
              <Card key={nft.id} className="overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={nft.metadata?.image || "/placeholder.svg?height=400&width=400"}
                    alt={nft.metadata?.name || "NFT"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">
                      #{nft.edition_number} of {nft.max_editions}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{nft.metadata?.name || "Untitled NFT"}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {nft.metadata?.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs font-mono text-muted-foreground truncate">{nft.token_id}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3 mb-4">
                <SuiIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">No NFTs Yet</h3>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                You don't own any NFTs yet. Mint your first NFT or purchase one from the marketplace.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/nfts/mint">Mint NFT</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="tickets" className="mt-6">
        <h2 className="text-2xl font-bold mb-6">My Tickets</h2>

        {userTickets && userTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userTickets.map((ticket) => (
              <Card key={ticket.id} className="overflow-hidden">
                <div className="relative">
                  <Image
                    src={ticket.event.cover_url || "/placeholder.svg?height=400&width=600"}
                    alt={ticket.event.title}
                    width={600}
                    height={300}
                    className="w-full object-cover h-48"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary">{ticket.ticket_type.name}</Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle>{ticket.event.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(ticket.event.event_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(ticket.event.event_date).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{ticket.event.venue}</span>
                    </div>
                  </div>

                  {ticket.token_id && (
                    <div className="p-3 bg-muted rounded-md">
                      <div className="text-xs text-muted-foreground">NFT Token ID</div>
                      <div className="font-mono text-sm truncate">{ticket.token_id}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Ticket className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">No Tickets Yet</h3>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                You haven't purchased any event tickets yet. Browse upcoming events to find your next experience.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/tickets">Explore Events</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="bookings" className="mt-6">
        <h2 className="text-2xl font-bold mb-6">My Bookings</h2>

        {userBookings && userBookings.length > 0 ? (
          <div className="space-y-6">
            {userBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>{booking.event_name}</CardTitle>
                      <CardDescription>{booking.event_description}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        booking.is_cancelled
                          ? "destructive"
                          : booking.is_completed
                            ? "outline"
                            : booking.is_confirmed
                              ? "default"
                              : "secondary"
                      }
                    >
                      {booking.is_cancelled
                        ? "Cancelled"
                        : booking.is_completed
                          ? "Completed"
                          : booking.is_confirmed
                            ? "Confirmed"
                            : "Pending"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Date & Time</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(booking.event_date).toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Venue</div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.venue}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Fee</div>
                      <div className="flex items-center gap-2">
                        <SuiIcon className="h-4 w-4" />
                        <span className="font-bold">{booking.fee} SUI</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Deposit</div>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.deposit_amount} SUI</span>
                        <Badge variant={booking.deposit_paid ? "outline" : "secondary"} className="ml-2">
                          {booking.deposit_paid ? "Paid" : "Unpaid"}
                        </Badge>
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      View Details
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">No Bookings Yet</h3>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                You haven't made any artist bookings yet. Browse artists to book for your next event.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/booking">Browse Artists</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="royalties" className="mt-6">
        <h2 className="text-2xl font-bold mb-6">My Royalties</h2>

        {userRoyalties && userRoyalties.length > 0 ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Royalty Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Earned</div>
                    <div className="text-2xl font-bold flex items-center">
                      <SuiIcon className="h-5 w-5 mr-1" />
                      {userRoyalties.reduce((sum, royalty) => sum + Number.parseFloat(royalty.amount), 0).toFixed(2)}{" "}
                      SUI
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">This Month</div>
                    <div className="text-2xl font-bold flex items-center">
                      <SuiIcon className="h-5 w-5 mr-1" />
                      {userRoyalties
                        .filter((r) => {
                          const date = new Date(r.created_at)
                          const now = new Date()
                          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                        })
                        .reduce((sum, royalty) => sum + Number.parseFloat(royalty.amount), 0)
                        .toFixed(2)}{" "}
                      SUI
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Transactions</div>
                    <div className="text-2xl font-bold">{userRoyalties.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Royalty Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userRoyalties.slice(0, 5).map((royalty) => (
                    <div key={royalty.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                      <div>
                        <div className="font-medium">{royalty.content.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(royalty.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <SuiIcon className="h-3 w-3" />
                          <span>{Number.parseFloat(royalty.amount).toFixed(2)} SUI</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{royalty.payment_type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">No Royalties Yet</h3>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                You haven't received any royalty payments yet. Upload content and set royalty percentages to start
                earning.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/content/upload">Upload Content</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
