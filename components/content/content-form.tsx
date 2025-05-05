"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { getBrowserSupabaseClient } from "@/lib/supabase/client"
import { getSuiClient } from "@/lib/blockchain/sui-client"
import { Loader2, Upload, Music, Film, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function ContentForm({ initialContent }) {
  const [content, setContent] = useState({
    content_type: "music",
    is_nft: false,
    royalty_percentage: 10,
    ...initialContent,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [coverFile, setCoverFile] = useState(null)
  const [contentFile, setContentFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(initialContent?.cover_url || null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [mintingNft, setMintingNft] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)

  const router = useRouter()
  const supabase = getBrowserSupabaseClient()
  const suiClient = getSuiClient()

  useEffect(() => {
    const checkWalletConnection = async () => {
      const wallet = suiClient.getWallet()
      setWalletConnected(!!wallet)
    }

    checkWalletConnection()
  }, [])

  const handleCoverChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    setCoverFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setCoverPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleContentFileChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    setContentFile(file)
  }

  const connectWallet = async () => {
    try {
      await suiClient.connect()
      setWalletConnected(true)
    } catch (error) {
      setError("Failed to connect wallet: " + error.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    setUploadProgress(0)

    try {
      // Check if NFT and wallet is connected
      if (content.is_nft && !walletConnected) {
        throw new Error("Please connect your wallet to mint an NFT")
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Upload cover image if changed
      let coverUrl = content.cover_url
      if (coverFile) {
        const fileExt = coverFile.name.split(".").pop()
        const filePath = `covers/${user.id}_${Date.now()}.${fileExt}`

        setUploadProgress(10)
        const { error: uploadError } = await supabase.storage
          .from("covers")
          .upload(filePath, coverFile, { upsert: true })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("covers").getPublicUrl(filePath)
        coverUrl = publicUrl
        setUploadProgress(30)
      }

      // Upload content file if provided
      let contentUrl = content.content_url
      if (contentFile) {
        const fileExt = contentFile.name.split(".").pop()
        const filePath = `content/${user.id}_${Date.now()}.${fileExt}`

        setUploadProgress(40)
        const { error: uploadError } = await supabase.storage
          .from("content")
          .upload(filePath, contentFile, { upsert: true })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("content").getPublicUrl(filePath)
        contentUrl = publicUrl
        setUploadProgress(70)
      }

      let contentId = initialContent?.id

      // Create or update content
      if (contentId) {
        // Update existing content
        const { error: updateError } = await supabase
          .from("content")
          .update({
            ...content,
            cover_url: coverUrl,
            content_url: contentUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", contentId)

        if (updateError) throw updateError
      } else {
        // Create new content
        const { data, error: insertError } = await supabase
          .from("content")
          .insert({
            ...content,
            creator_id: user.id,
            cover_url: coverUrl,
            content_url: contentUrl,
          })
          .select()

        if (insertError) throw insertError

        contentId = data[0].id
      }

      setUploadProgress(80)

      // Mint NFT if requested
      if (content.is_nft && contentId) {
        setMintingNft(true)

        // Prepare metadata for NFT
        const metadata = {
          name: content.title,
          description: content.description,
          image: coverUrl,
          content: contentUrl,
          creator: user.id,
          contentType: content.content_type,
          royaltyPercentage: content.royalty_percentage,
        }

        // Mint NFT on Sui blockchain
        const nft = await suiClient.mintNFT(contentId, metadata)

        // Save NFT data to database
        await supabase.from("nfts").insert({
          content_id: contentId,
          token_id: nft.id,
          edition_number: nft.edition,
          max_editions: nft.maxEditions,
          owner_id: user.id,
          metadata: nft.metadata,
        })

        setMintingNft(false)
      }

      setUploadProgress(100)
      setSuccess(true)

      setTimeout(() => {
        router.push(`/content/${contentId}`)
        router.refresh()
      }, 1500)
    } catch (error) {
      setError(error.message || "An error occurred while saving content")
      setUploadProgress(0)
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
                  content_type: value,
                })
              }
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={content.description || ""}
              onChange={(e) => setContent({ ...content, description: e.target.value })}
              rows={4}
              disabled={loading}
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
                <Input
                  id="cover"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("cover")?.click()}
                  className="w-full"
                  disabled={loading}
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
                disabled={loading}
              />
              {content.content_url && !contentFile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.open(content.content_url, "_blank")}
                  disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="royalty_percentage">Royalty Percentage</Label>
              <span className="text-sm font-medium">{content.royalty_percentage}%</span>
            </div>
            <Slider
              id="royalty_percentage"
              min={0}
              max={25}
              step={0.5}
              value={[content.royalty_percentage || 10]}
              onValueChange={(value) => setContent({ ...content, royalty_percentage: value[0] })}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">Percentage of sales you'll receive as royalties (max 25%)</p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_nft"
              checked={content.is_nft || false}
              onCheckedChange={(checked) => setContent({ ...content, is_nft: checked })}
              disabled={loading}
            />
            <Label htmlFor="is_nft">Mint as NFT</Label>
          </div>

          {content.is_nft && !walletConnected && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                <span>Connect your wallet to mint an NFT</span>
                <Button type="button" onClick={connectWallet} variant="outline" size="sm">
                  Connect Wallet
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {mintingNft && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Minting NFT on Sui blockchain...</AlertDescription>
            </Alert>
          )}

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
                {uploadProgress > 0 ? `Uploading (${uploadProgress}%)` : "Saving..."}
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
