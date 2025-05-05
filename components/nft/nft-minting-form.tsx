"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { getBrowserSupabaseClient } from "@/lib/supabase/client"
import { getSuiClient } from "@/lib/blockchain/sui-client"
import { Loader2, Upload, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function NFTMintingForm({ contentId }) {
  const [nftData, setNftData] = useState({
    name: "",
    description: "",
    maxEditions: 10,
    royaltyPercentage: 10,
  })
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [progress, setProgress] = useState(0)
  const [walletConnected, setWalletConnected] = useState(false)

  const router = useRouter()
  const supabase = getBrowserSupabaseClient()
  const suiClient = getSuiClient()

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
    setProgress(0)

    try {
      // Check if wallet is connected
      if (!walletConnected) {
        throw new Error("Please connect your wallet to mint an NFT")
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Fetch content data if contentId is provided
      let contentData = null
      if (contentId) {
        const { data } = await supabase.from("content").select().eq("id", contentId).single()

        if (!data) throw new Error("Content not found")
        contentData = data

        // Pre-fill NFT data from content if not already set
        if (!nftData.name) setNftData({ ...nftData, name: contentData.title })
        if (!nftData.description) setNftData({ ...nftData, description: contentData.description })
      }

      setProgress(10)

      // Upload cover image if changed
      let coverUrl = contentData?.cover_url
      if (coverFile) {
        const fileExt = coverFile.name.split(".").pop()
        const filePath = `nft-covers/${user.id}_${Date.now()}.${fileExt}`

        setProgress(20)
        const { error: uploadError } = await supabase.storage
          .from("covers")
          .upload(filePath, coverFile, { upsert: true })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("covers").getPublicUrl(filePath)
        coverUrl = publicUrl
        setProgress(40)
      }

      if (!coverUrl) {
        throw new Error("Cover image is required")
      }

      setProgress(50)

      // Prepare metadata for NFT
      const metadata = {
        name: nftData.name || contentData?.title,
        description: nftData.description || contentData?.description,
        image: coverUrl,
        content: contentData?.content_url,
        creator: user.id,
        contentType: contentData?.content_type || "other",
        royaltyPercentage: nftData.royaltyPercentage,
      }

      setProgress(60)

      // Mint NFT on Sui blockchain
      const nft = await suiClient.mintNFT(contentId || "custom-nft", metadata)

      setProgress(80)

      // Save NFT data to database
      if (contentId) {
        // Update content to mark as NFT
        await supabase
          .from("content")
          .update({
            is_nft: true,
            royalty_percentage: nftData.royaltyPercentage,
          })
          .eq("id", contentId)
      }

      // Save NFT record
      await supabase.from("nfts").insert({
        content_id: contentId || null,
        token_id: nft.id,
        edition_number: nft.edition,
        max_editions: nftData.maxEditions,
        owner_id: user.id,
        metadata: nft.metadata,
      })

      setProgress(100)
      setSuccess(true)

      setTimeout(() => {
        if (contentId) {
          router.push(`/content/${contentId}`)
        } else {
          router.push("/nfts")
        }
        router.refresh()
      }, 1500)
    } catch (error) {
      setError(error.message || "An error occurred while minting NFT")
      setProgress(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Mint NFT</CardTitle>
        <CardDescription>Create a unique digital asset on the Sui blockchain</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">NFT Name</Label>
            <Input
              id="name"
              value={nftData.name}
              onChange={(e) => setNftData({ ...nftData, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={nftData.description}
              onChange={(e) => setNftData({ ...nftData, description: e.target.value })}
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">NFT Image</Label>
            <div className="flex items-center gap-4">
              <div className="relative h-32 w-32 rounded-md overflow-hidden bg-muted">
                {coverPreview ? (
                  <img
                    src={coverPreview || "/placeholder.svg"}
                    alt="NFT preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <span className="text-muted-foreground">No image</span>
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
                  Upload Image
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="maxEditions">Maximum Editions</Label>
              <span className="text-sm font-medium">{nftData.maxEditions}</span>
            </div>
            <Slider
              id="maxEditions"
              min={1}
              max={100}
              step={1}
              value={[nftData.maxEditions]}
              onValueChange={(value) => setNftData({ ...nftData, maxEditions: value[0] })}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">Maximum number of copies that can be minted</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="royaltyPercentage">Royalty Percentage</Label>
              <span className="text-sm font-medium">{nftData.royaltyPercentage}%</span>
            </div>
            <Slider
              id="royaltyPercentage"
              min={0}
              max={25}
              step={0.5}
              value={[nftData.royaltyPercentage]}
              onValueChange={(value) => setNftData({ ...nftData, royaltyPercentage: value[0] })}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">Percentage of sales you'll receive as royalties (max 25%)</p>
          </div>

          {!walletConnected && (
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

          {progress > 0 && progress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Minting NFT...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>NFT minted successfully! Redirecting...</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="ml-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {progress > 0 ? `Minting (${progress}%)` : "Processing..."}
              </>
            ) : (
              "Mint NFT"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
