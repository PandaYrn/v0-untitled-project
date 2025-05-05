import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SuiIcon } from "@/components/sui-icon"
import { Heart, Share2, Clock, User, ArrowUpRight, ShoppingCart } from "lucide-react"

interface NFTDetailsProps {
  nft: {
    id: string
    title: string
    artist: string
    cover: string
    price: string
    edition: string
    type: string
    description: string
    likes: number
    timeLeft: string
    attributes?: Array<{ trait_type: string; value: string }>
    history?: Array<{ event: string; from: string; to: string; price: string; date: string }>
  }
}

export function NFTDetails({ nft }: NFTDetailsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-8">
      <div className="space-y-6">
        <Card>
          <CardContent className="p-0">
            <div className="relative">
              <Image
                src={nft.cover || "/placeholder.svg"}
                alt={nft.title}
                width={800}
                height={800}
                className="w-full aspect-square object-cover rounded-t-lg"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="secondary" size="icon" className="rounded-full h-10 w-10">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="secondary" size="icon" className="rounded-full h-10 w-10">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{nft.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {nft.attributes?.map((attr, index) => (
                <div key={index} className="bg-secondary/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground uppercase">{attr.trait_type}</div>
                  <div className="font-medium truncate">{attr.value}</div>
                </div>
              )) || (
                <>
                  <div className="bg-secondary/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase">Type</div>
                    <div className="font-medium truncate">{nft.type}</div>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase">Edition</div>
                    <div className="font-medium truncate">{nft.edition}</div>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase">Artist</div>
                    <div className="font-medium truncate">{nft.artist}</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="outline" className="mb-2">
                  {nft.type}
                </Badge>
                <CardTitle className="text-2xl">{nft.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <User className="h-3 w-3" />
                  <span>{nft.artist}</span>
                </CardDescription>
              </div>
              <Badge variant="secondary">{nft.edition}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">Current price</div>
              <div className="flex items-center gap-1">
                <SuiIcon className="h-5 w-5" />
                <span className="text-xl font-bold">{nft.price}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Sale ends in {nft.timeLeft}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span>{nft.likes}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy Now
              </Button>
              <Button variant="outline" className="flex-1">
                Make Offer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="transactions">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="ownership">Ownership</TabsTrigger>
              </TabsList>
              <TabsContent value="transactions" className="pt-4">
                <div className="space-y-4">
                  {nft.history?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-3 last:border-0">
                      <div>
                        <div className="font-medium">{item.event}</div>
                        <div className="text-xs text-muted-foreground">{item.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <SuiIcon className="h-3 w-3" />
                          <span>{item.price}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          View <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )) || <div className="text-center py-4 text-muted-foreground">No transaction history available</div>}
                </div>
              </TabsContent>
              <TabsContent value="ownership" className="pt-4">
                <div className="text-center py-4 text-muted-foreground">Ownership history will be displayed here</div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
