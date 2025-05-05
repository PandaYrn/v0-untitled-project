import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Music, Film, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function ContentCard({ content }) {
  const contentTypeIcon = content.content_type === "music" ? Music : Film

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="relative aspect-square">
        <Image
          src={content.cover_url || "/placeholder.svg?height=400&width=400"}
          alt={content.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={content.is_nft ? "default" : "secondary"}>{content.is_nft ? "NFT" : "Digital"}</Badge>
        </div>
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className="bg-background/80">
            <contentTypeIcon className="h-3 w-3 mr-1" />
            {content.content_type === "music" ? "Music" : "Movie"}
          </Badge>
        </div>
      </div>
      <CardContent className="pt-4 flex-grow">
        <div className="space-y-1">
          <h3 className="font-bold truncate">{content.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{content.description}</p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center">
            <p className="font-medium">${content.price.toFixed(2)}</p>
            {content.royalty_percentage > 0 && (
              <span className="text-xs text-muted-foreground ml-2">{content.royalty_percentage}% royalty</span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/content/${content.id}`}>Preview</Link>
          </Button>
          <Button size="sm" className="w-full">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
