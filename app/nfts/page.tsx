import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { Heart, User, Clock, SuiIcon } from "@/components/ui-icon"

export default function NFTsPage() {
  // This would come from blockchain/API in a real implementation
  const nfts = [
    {
      id: "201",
      title: "Genesis Song",
      artist: "First Creators",
      cover: "/placeholder.svg?height=400&width=400",
      price: "5 SUI",
      edition: "1 of 10",
      type: "Audio NFT",
      description: "The first song minted as an NFT on our platform with exclusive rights and royalties.",
      likes: 128,
      timeLeft: "2 days",
    },
    {
      id: "202",
      title: "Director's Cut",
      artist: "Blockchain Films",
      cover: "/placeholder.svg?height=400&width=400",
      price: "10 SUI",
      edition: "1 of 5",
      type: "Movie NFT",
      description: "Exclusive director's cut with behind-the-scenes content and ownership rights.",
      likes: 89,
      timeLeft: "12 hours",
    },
    {
      id: "203",
      title: "Limited Soundtrack",
      artist: "Crypto Composers",
      cover: "/placeholder.svg?height=400&width=400",
      price: "3 SUI",
      edition: "3 of 20",
      type: "Audio Collection",
      description: "Complete album with unique artwork and exclusive listening party access.",
      likes: 215,
      timeLeft: "5 days",
    },
    {
      id: "204",
      title: "Virtual Concert Experience",
      artist: "Aurora Nights",
      cover: "/placeholder.svg?height=400&width=400",
      price: "7.5 SUI",
      edition: "8 of 50",
      type: "Experience NFT",
      description: "Virtual reality concert experience with interactive elements and meet-and-greet.",
      likes: 342,
      timeLeft: "3 days",
    },
  ]

  return (
    <main className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">NFT Marketplace</h1>
          <p className="text-muted-foreground">Exclusive music and movie NFTs with ownership benefits and royalties</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <Card key={nft.id} className="overflow-hidden">
              <div className="relative">
                <Image
                  src={nft.cover || "/placeholder.svg"}
                  alt={nft.title}
                  width={400}
                  height={400}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">{nft.type}</Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-background/60 backdrop-blur-sm">
                    {nft.edition}
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2">
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="line-clamp-1">{nft.title}</CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{nft.artist}</span>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{nft.description}</p>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{nft.timeLeft}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{nft.likes}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <SuiIcon className="h-4 w-4" />
                  <span className="font-bold">{nft.price}</span>
                </div>
                <Button asChild>
                  <Link href={`/nfts/${nft.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="md:w-1/3">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Create NFT"
                  width={200}
                  height={200}
                  className="rounded-lg mx-auto"
                />
              </div>
              <div className="md:w-2/3 space-y-4">
                <h2 className="text-2xl font-bold">Create Your Own NFT</h2>
                <p className="text-muted-foreground">
                  Turn your music, movies, or artwork into valuable NFTs. Set royalties, limited editions, and special
                  perks for owners.
                </p>
                <Button asChild>
                  <Link href="/create-nft">Get Started</Link>
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="md:w-1/3">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="NFT Benefits"
                  width={200}
                  height={200}
                  className="rounded-lg mx-auto"
                />
              </div>
              <div className="md:w-2/3 space-y-4">
                <h2 className="text-2xl font-bold">NFT Ownership Benefits</h2>
                <p className="text-muted-foreground">
                  Enjoy exclusive access, streaming rights, and royalty shares. Each NFT is a unique digital asset on
                  the Sui blockchain.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/nft-benefits">Learn More</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button variant="outline">Load More NFTs</Button>
        </div>
      </div>
    </main>
  )
}
