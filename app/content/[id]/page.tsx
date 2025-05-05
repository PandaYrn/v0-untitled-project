import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SuiIcon } from "@/components/sui-icon"
import { Heart, Share2, Play, User, ShoppingCart, MessageSquare } from "lucide-react"
import { CommentSection } from "@/components/content/comment-section"
import Link from "next/link"

export default async function ContentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()

  // Fetch content with creator profile
  const { data: content, error } = await supabase
    .from("content")
    .select(`
      *,
      profiles:creator_id(*)
    `)
    .eq("id", params.id)
    .single()

  if (error || !content) {
    notFound()
  }

  // Fetch comments
  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      profiles:user_id(*)
    `)
    .eq("content_id", content.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <Image
                  src={content.cover_url || "/placeholder.svg?height=600&width=600"}
                  alt={content.title}
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

              {content.content_url && (
                <div className="p-4 flex justify-center">
                  {content.content_type === "music" ? (
                    <audio controls className="w-full">
                      <source src={content.content_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <video controls className="w-full max-h-[500px]">
                      <source src={content.content_url} type="video/mp4" />
                      Your browser does not support the video element.
                    </video>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{content.description || "No description provided."}</p>
            </CardContent>
          </Card>

          <CommentSection contentId={content.id} comments={comments || []} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {content.content_type}
                  </Badge>
                  {content.is_nft && (
                    <Badge variant="secondary" className="ml-2 mb-2">
                      NFT
                    </Badge>
                  )}
                  <CardTitle className="text-2xl">{content.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <User className="h-3 w-3" />
                    <Link href={`/profile/${content.profiles.id}`} className="hover:underline">
                      {content.profiles.username}
                    </Link>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="flex items-center gap-1">
                  <SuiIcon className="h-5 w-5" />
                  <span className="text-xl font-bold">{content.price}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Royalty</div>
                <div className="text-sm">{content.royalty_percentage}%</div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button className="flex-1">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Now
                </Button>
                <Button variant="outline" className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  {content.content_type === "music" ? "Play" : "Watch"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Creator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={content.profiles.avatar_url || "/placeholder.svg?height=100&width=100"}
                    alt={content.profiles.username}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{content.profiles.username}</h3>
                  <p className="text-sm text-muted-foreground">
                    {content.profiles.bio
                      ? content.profiles.bio.substring(0, 100) + (content.profiles.bio.length > 100 ? "..." : "")
                      : "No bio provided"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/profile/${content.profiles.id}`}>View Profile</Link>
                </Button>
                <Button variant="outline" size="icon">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
