"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { MediaPlayer } from "@/components/player/media-player"
import { CommentSection } from "@/components/content/comment-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Heart, Share2, ShoppingCart, Calendar, User, Tag, Edit } from "lucide-react"
import { SuiIcon } from "@/components/sui-icon"
import { useTrackContentView } from "@/hooks/use-track-content-view"
import { Analytics } from "@/lib/analytics/client"

export default function ContentDetailPage() {
  const { id } = useParams()
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [nftData, setNftData] = useState(null)
  const [createdAt, setCreatedAt] = useState("")
  const [isOwner, setIsOwner] = useState(false)
  const [user, setUser] = useState(null)

  // Track content view
  useTrackContentView(id as string)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const supabase = createClientSupabaseClient()

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        const { data, error } = await supabase
          .from("content")
          .select(`
            *,
            profiles:creator_id(*)
          `)
          .eq("id", id)
          .single()

        if (error) throw error

        setContent(data)

        // Track engagement event
        Analytics.trackEngagement({
          eventType: "content_view",
          contentId: id as string,
          metadata: {
            contentType: data.content_type,
            title: data.title,
          },
        })
      } catch (error) {
        console.error("Error fetching content:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    const fetchPurchaseStatus = async () => {
      if (user && content) {
        const supabase = createClientSupabaseClient()
        const { data: purchase } = await supabase
          .from("purchases")
          .select()
          .eq("content_id", content.id)
          .eq("user_id", user.id)
          .maybeSingle()

        setHasPurchased(!!purchase)
      }
    }

    const fetchNftData = async () => {
      if (content && content.is_nft) {
        const supabase = createClientSupabaseClient()
        const { data: nft } = await supabase.from("nfts").select().eq("content_id", content.id).maybeSingle()

        setNftData(nft)
      }
    }

    const formatDate = () => {
      if (content) {
        const date = new Date(content.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        setCreatedAt(date)
      }
    }

    const checkOwnership = () => {
      if (user && content) {
        setIsOwner(user?.id === content.creator_id)
      }
    }

    if (id) {
      fetchContent()
    }

    // Call other functions inside useEffect whenever content or user changes
    // to avoid race conditions
  }, [id])

  useEffect(() => {
    fetchPurchaseStatus()
  }, [user, content])

  useEffect(() => {
    fetchNftData()
  }, [content])

  useEffect(() => {
    formatDate()
  }, [content])

  useEffect(() => {
    checkOwnership()
  }, [user, content])

  if (loading) {
    return <div>Loading content...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!content) {
    return notFound()
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-8">
          {/* Media Player */}
          <MediaPlayer
            type={content.content_type === "music" ? "audio" : "video"}
            src={content.content_url}
            title={content.title}
            artist={content.profiles?.full_name || content.profiles?.username}
            coverUrl={content.cover_url}
            autoplay={false}
          />

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{content.description}</p>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <CommentSection contentId={content.id} />
        </div>

        <div className="space-y-6">
          {/* Content Info */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {content.content_type.charAt(0).toUpperCase() + content.content_type.slice(1)}
                  </Badge>
                  <CardTitle className="text-2xl">{content.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <User className="h-3 w-3" />
                    <Link href={`/profile/${content.profiles?.creator_id}`} className="hover:underline">
                      {content.profiles?.full_name || content.profiles?.username}
                    </Link>
                  </CardDescription>
                </div>
                {content.is_nft && <Badge variant="secondary">NFT</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="flex items-center gap-1">
                  <SuiIcon className="h-5 w-5" />
                  <span className="text-xl font-bold">{content.price} SUI</span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{createdAt}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Royalty</span>
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span>{content.royalty_percentage}%</span>
                  </div>
                </div>
              </div>

              {nftData && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-medium">NFT Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Edition</span>
                        <p>
                          {nftData.edition_number} of {nftData.max_editions}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Token ID</span>
                        <p className="font-mono text-xs truncate">{nftData.token_id}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              {!isOwner && !hasPurchased && (
                <Button className="w-full">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Now
                </Button>
              )}

              {hasPurchased && (
                <div className="bg-primary/10 text-primary rounded-md p-2 text-center text-sm">
                  You own this content
                </div>
              )}

              {isOwner && (
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/content/${content.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Content
                  </Link>
                </Button>
              )}

              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Favorite
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Creator Info */}
          <Card>
            <CardHeader>
              <CardTitle>Creator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Image
                  src={content.profiles?.avatar_url || "/placeholder.svg?height=80&width=80"}
                  alt={content.profiles?.username || "Creator"}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-bold">{content.profiles?.full_name || content.profiles?.username}</h3>
                  {content.profiles?.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{content.profiles.bio}</p>
                  )}
                  <Button variant="link" asChild className="p-0 h-auto">
                    <Link href={`/profile/${content.profiles?.creator_id}`}>View Profile</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
