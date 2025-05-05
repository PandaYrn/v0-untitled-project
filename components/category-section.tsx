import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, ArrowRight, Heart } from "lucide-react"
import { SuiIcon } from "@/components/sui-icon"

interface CategorySectionProps {
  title: string
  category: string
}

export function CategorySection({ title, category }: CategorySectionProps) {
  // This would come from blockchain/API in a real implementation
  const getItems = (cat: string) => {
    if (cat === "new") {
      return [
        {
          id: "101",
          title: "City Lights",
          artist: "Urban Dreamers",
          cover: "/placeholder.svg?height=400&width=400",
          type: "song",
          price: "0.15 SUI",
          likes: 42,
          new: true,
        },
        {
          id: "102",
          title: "Metaverse Journey",
          artist: "Virtual Explorers",
          cover: "/placeholder.svg?height=400&width=400",
          type: "movie",
          price: "1.75 SUI",
          likes: 63,
          new: true,
        },
        {
          id: "103",
          title: "Decentralized",
          artist: "Chain Breakers",
          cover: "/placeholder.svg?height=400&width=400",
          type: "song",
          price: "0.2 SUI",
          likes: 28,
          new: true,
        },
      ]
    } else if (cat === "nft") {
      return [
        {
          id: "201",
          title: "Genesis Song",
          artist: "First Creators",
          cover: "/placeholder.svg?height=400&width=400",
          type: "nft",
          price: "5 SUI",
          edition: "1 of 10",
          likes: 209,
        },
        {
          id: "202",
          title: "Director's Cut",
          artist: "Blockchain Films",
          cover: "/placeholder.svg?height=400&width=400",
          type: "nft",
          price: "10 SUI",
          edition: "1 of 5",
          likes: 147,
        },
        {
          id: "203",
          title: "Limited Soundtrack",
          artist: "Crypto Composers",
          cover: "/placeholder.svg?height=400&width=400",
          type: "nft",
          price: "3 SUI",
          edition: "3 of 20",
          likes: 93,
        },
      ]
    }
    return []
  }

  const items = getItems(category)

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <Button variant="ghost" className="hidden md:flex" asChild>
          <Link href={`/${category === "new" ? "marketplace" : category + "s"}`} className="group">
            View All
            <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden card-hover bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="relative">
                <Image
                  src={item.cover || "/placeholder.svg"}
                  alt={item.title}
                  width={400}
                  height={400}
                  className="object-cover aspect-square w-full"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="default" className="rounded-md">
                    View Details <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                {item.new && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                      New
                    </Badge>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <div className="flex items-center bg-black/60 text-white px-2 py-0.5 rounded-md text-xs">
                    <SuiIcon className="h-3 w-3 mr-1" />
                    {item.price}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <Link href={`/${item.type}s/${item.id}`} className="font-semibold hover:underline line-clamp-1">
                      {item.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.artist}</p>
                  </div>
                  {item.edition && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {item.edition}
                    </Badge>
                  )}
                </div>

                <div className="flex justify-between items-center mt-2">
                  <Badge variant="secondary" className="text-xs font-normal">
                    {item.type === "nft" ? "NFT" : item.type}
                  </Badge>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Heart className="h-3.5 w-3.5 mr-1" />
                    <span>{item.likes}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center md:hidden">
        <Button variant="outline" asChild>
          <Link href={`/${category === "new" ? "marketplace" : category + "s"}`}>View All</Link>
        </Button>
      </div>
    </section>
  )
}
