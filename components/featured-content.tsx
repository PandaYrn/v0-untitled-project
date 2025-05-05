import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Heart, ExternalLink, Sparkles, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SuiIcon } from "@/components/sui-icon"

interface FeaturedContentProps {
  title: string
  description?: string
}

export function FeaturedContent({ title, description }: FeaturedContentProps) {
  // This would come from blockchain/API in a real implementation
  const featuredItems = [
    {
      id: "1",
      title: "Harmony in Chaos",
      artist: "Aurora Nights",
      cover: "/placeholder.svg?height=400&width=400",
      type: "song",
      price: "0.25 SUI",
      likes: 128,
      rating: 4.9,
      featured: true,
    },
    {
      id: "2",
      title: "Digital Dreams",
      artist: "Pixel Productions",
      cover: "/placeholder.svg?height=400&width=400",
      type: "movie",
      price: "1.5 SUI",
      likes: 87,
      rating: 4.7,
      featured: false,
    },
    {
      id: "3",
      title: "Blockchain Beats",
      artist: "Crypto Collective",
      cover: "/placeholder.svg?height=400&width=400",
      type: "album",
      price: "0.75 SUI",
      likes: 215,
      rating: 4.8,
      featured: false,
    },
    {
      id: "4",
      title: "Web3 Wonders",
      artist: "DeFi Directors",
      cover: "/placeholder.svg?height=400&width=400",
      type: "movie",
      price: "2 SUI",
      likes: 156,
      rating: 4.5,
      featured: true,
    },
  ]

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {title}
            {title.includes("Top") && <Sparkles className="h-5 w-5 text-sui" />}
          </h2>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <Button variant="ghost" className="hidden md:flex" asChild>
          <Link href="/marketplace" className="group">
            View All
            <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredItems.map((item) => (
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
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <Button
                    variant="default"
                    size="icon"
                    className="rounded-full h-12 w-12 text-xl hover:scale-110 transition-transform"
                  >
                    <Play className="h-6 w-6 fill-primary-foreground text-primary-foreground ml-1" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full h-10 w-10 hover:scale-110 transition-transform"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>

                {item.featured && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className="bg-sui hover:bg-sui-dark">
                      <Star className="h-3 w-3 mr-1 fill-white" /> Featured
                    </Badge>
                  </div>
                )}

                <div className="absolute top-2 right-2">
                  <div className="flex items-center bg-black/60 text-white px-2 py-0.5 rounded-md text-xs">
                    <SuiIcon className="h-3 w-3 mr-1" />
                    {item.price}
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 glass-effect px-2 py-0.5 text-xs rounded-md uppercase font-medium">
                  {item.type}
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div>
                  <Link href={`/${item.type}s/${item.id}`} className="font-semibold hover:underline line-clamp-1">
                    {item.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{item.artist}</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm ml-1 font-medium">{item.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Heart className="h-3.5 w-3.5 mr-1" />
                    <span className="text-sm">{item.likes}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center md:hidden">
        <Button variant="outline" asChild>
          <Link href="/marketplace">View All</Link>
        </Button>
      </div>
    </section>
  )
}
