"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Heart, ShoppingCart, Star } from "lucide-react"
import { SuiIcon } from "@/components/sui-icon"
import type { Database } from "@/lib/supabase/database.types"

type Content = Database["public"]["Tables"]["content"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"]
}

interface ContentCardProps {
  content: Content
  onPlayClick?: (content: Content) => void
  onLikeClick?: (content: Content) => void
  onBuyClick?: (content: Content) => void
}

export function ContentCard({ content, onPlayClick, onLikeClick, onBuyClick }: ContentCardProps) {
  return (
    <Card className="overflow-hidden card-hover bg-card/50 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="relative">
          <Image
            src={content.cover_url || "/placeholder.svg?height=400&width=400"}
            alt={content.title}
            width={400}
            height={400}
            className="object-cover aspect-square w-full"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <Button
              variant="default"
              size="icon"
              className="rounded-full h-12 w-12 text-xl hover:scale-110 transition-transform"
              onClick={() => onPlayClick?.(content)}
            >
              <Play className="h-6 w-6 fill-primary-foreground text-primary-foreground ml-1" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full h-10 w-10 hover:scale-110 transition-transform"
              onClick={() => onLikeClick?.(content)}
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {content.is_nft && (
            <div className="absolute top-2 left-2">
              <Badge variant="default" className="bg-sui hover:bg-sui-dark">
                <Star className="h-3 w-3 mr-1 fill-white" /> NFT
              </Badge>
            </div>
          )}

          <div className="absolute top-2 right-2">
            <div className="flex items-center bg-black/60 text-white px-2 py-0.5 rounded-md text-xs">
              <SuiIcon className="h-3 w-3 mr-1" />
              {content.price}
            </div>
          </div>

          <div className="absolute bottom-2 left-2 glass-effect px-2 py-0.5 text-xs rounded-md uppercase font-medium">
            {content.content_type}
          </div>
        </div>
        <div className="p-4 space-y-2">
          <div>
            <Link href={`/content/${content.id}`} className="font-semibold hover:underline line-clamp-1">
              {content.title}
            </Link>
            <p className="text-sm text-muted-foreground">{content.profiles.username}</p>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="p-0 h-8" onClick={() => onPlayClick?.(content)}>
                <Play className="h-4 w-4 mr-1" />
                Play
              </Button>
            </div>
            <Button size="icon" variant="ghost" onClick={() => onBuyClick?.(content)}>
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
