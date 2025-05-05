"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getBrowserSupabaseClient } from "@/lib/supabase/client"
import { Loader2, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Database } from "@/lib/supabase/database.types"

type Comment = Database["public"]["Tables"]["comments"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"]
}

interface CommentSectionProps {
  contentId: string
  comments: Comment[]
}

export function CommentSection({ contentId, comments: initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = getBrowserSupabaseClient()

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    // Set up real-time subscription for comments
    const channel = supabase
      .channel("comments-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `content_id=eq.${contentId}`,
        },
        async (payload) => {
          // Fetch the complete comment with user profile
          const { data } = await supabase
            .from("comments")
            .select(`
              *,
              profiles:user_id(*)
            `)
            .eq("id", payload.new.id)
            .single()

          if (data) {
            setComments((prev) => [data as Comment, ...prev])
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [contentId, supabase])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      // Redirect to login or show login modal
      window.location.href = "/auth"
      return
    }

    if (!newComment.trim()) return

    setLoading(true)

    try {
      const { error } = await supabase.from("comments").insert({
        content_id: contentId,
        user_id: user.id,
        comment: newComment,
      })

      if (error) throw error

      // Clear input (the comment will be added via real-time subscription)
      setNewComment("")
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmitComment} className="flex gap-4 items-start">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none"
              disabled={!user}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !user}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 items-start">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles.avatar_url || undefined} />
                  <AvatarFallback>{comment.profiles.username?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.profiles.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-1">{comment.comment}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
