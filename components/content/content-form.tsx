"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getBrowserSupabaseClient } from "@/lib/supabase/client"
import { Loader2, Upload, Music, Film } from "lucide-react"
import type { Database } from "@/lib/supabase/database.types"

type Content = Database["public"]["Tables"]["content"]["Row"]

export function ContentForm({ initialContent }: { initialContent?: Partial<Content> }) {
  const [content, setContent] = useState<Partial<Content>>(
    initialContent || {
      content_type: "music",
      is_nft: false,
      royalty_percentage: 10,
    },
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [contentFile, setContentFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(initialContent?.cover_url || null)

  const router = useRouter()
  const supabase = getBrowserSupabaseClient()

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    setCoverFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setCoverPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleContentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    setContentFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Upload cover image if changed
      let coverUrl = content.cover_url
      if (coverFile) {
        const fileExt = coverFile.name.split(".").pop()
        const filePath = `covers/${user.id}_${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from("covers")
          .upload(filePath, coverFile, { upsert: true })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("covers").getPublicUrl(filePath)

        coverUrl = publicUrl
      }

      // Upload content file if provided
      let contentUrl = content.content_url
      if (contentFile) {
        const fileExt = contentFile.name.split(".").pop()
        const filePath = `content/${user.id}_${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from("content")
          .upload(filePath, contentFile, { upsert: true })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("content").getPublicUrl(filePath)

        contentUrl = publicUrl
      }

      // Create or update content
      if (initialContent?.id) {
        // Update existing content
        const { error: updateError } = await supabase
          .from("content")
          .update({
            ...content,
            cover_url: coverUrl,
            content_url: contentUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialContent.id)

        if (updateError) throw updateError
      } else {
        // Create new content
        const { error: insertError } = await supabase.from("content").insert({
          ...content,
          creator_id: user.id,
          cover_url: coverUrl,
          content_url: contentUrl,
        })

        if (insertError) throw insertError
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/marketplace")
        router.refresh()
      }, 1500)
    } catch (error: any) {
      setError(error.message || "An error occurred while saving content")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialContent?.id ? "Edit Content" : "Upload New Content"}</CardTitle>
        <CardDescription>
          {content.content_type === "music"
            ? "Share your music with the world and earn royalties"
            : "Upload your movie or video content to the platform"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="content_type">Content Type</Label>
            <Select
              value={content.content_type}
              onValueChange={(value) =>
                setContent({
                  ...content,
                  content_type: value as "music" | "movie" | "album" | "podcast",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="music">
                  <div className="flex items-center">
                    <Music className="mr-2 h-4 w-4" />
                    <span>Music</span>
                  </div>
                </SelectItem>
                <SelectItem value="movie">
                  <div className="flex items-center">
                    <Film className="mr-2 h-4 w-4" />
                    <span>Movie</span>
                  </div>
                </SelectItem>
                <SelectItem value="album">Album</SelectItem>
                <SelectItem value="podcast">Podcast</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={content.title || ""}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={content.description || ""}
              onChange={(e) => setContent({ ...content, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image</Label>
            <div className="flex items-center gap-4">
              <div className="relative h-32 w-32 rounded-md overflow-hidden bg-muted">
                {coverPreview ? (
                  <img
                    src={coverPreview || "/placeholder.svg"}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    {content.content_type === "music" ? (
                      <Music className="h-12 w-12 text-muted-foreground" />
                    ) : (
                      <Film className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Input id="cover" type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("cover")?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Cover
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content_file">Content File</Label>
            <div className="flex items-center gap-4">
              <Input
                id="content_file"
                type="file"
                accept={content.content_type === "music" ? "audio/*" : "video/*"}
                onChange={handleContentFileChange}
                className="flex-1"
              />
              {content.content_url && !contentFile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.open(content.content_url || "", "_blank")}
                >
                  View File
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {content.content_type === "music" ? "Upload MP3, WAV, or FLAC files" : "Upload MP4, MOV, or WebM files"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (SUI)</Label>
            <Input
              id="price"
              type="number"
              step="0.000001"
              min="0"
              value={content.price || ""}
              onChange={(e) => setContent({ ...content, price: Number.parseFloat(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="royalty_percentage">Royalty Percentage</Label>
            <Input
              id="royalty_percentage"
              type="number"
              step="0.01"
              min="0"
              max="25"
              value={content.royalty_percentage || 10}
              onChange={(e) => setContent({ ...content, royalty_percentage: Number.parseFloat(e.target.value) })}
              required
            />
            <p className="text-sm text-muted-foreground">Percentage of sales you'll receive as royalties (max 25%)</p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_nft"
              checked={content.is_nft || false}
              onCheckedChange={(checked) => setContent({ ...content, is_nft: checked })}
            />
            <Label htmlFor="is_nft">Mint as NFT</Label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>Content saved successfully! Redirecting...</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="ml-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initialContent?.id ? (
              "Update Content"
            ) : (
              "Upload Content"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
