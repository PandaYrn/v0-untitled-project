import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NFTMintingForm } from "@/components/nft/nft-minting-form"
import { redirect } from "next/navigation"

export default async function MintNFTPage({ searchParams }) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // If contentId is provided, we're minting an NFT for existing content
  const contentId = searchParams.contentId

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Mint NFT</h1>
      <NFTMintingForm contentId={contentId} />
    </div>
  )
}
