import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { contentId, walletAddress, edition, price, royaltyPercentage } = body

    if (!contentId || !walletAddress) {
      return NextResponse.json({ error: "Content ID and wallet address are required" }, { status: 400 })
    }

    // Verify content exists and user is the creator
    const { data: content } = await supabase
      .from("content")
      .select("creator_id, title, content_type")
      .eq("id", contentId)
      .single()

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    if (content.creator_id !== user.id) {
      return NextResponse.json({ error: "Only the content creator can mint NFTs" }, { status: 403 })
    }

    // In a real implementation, this would call the Sui blockchain
    // For now, we'll simulate the minting process

    // Create NFT record in database
    const nftId = uuidv4()
    const { error: nftError } = await supabase.from("nfts").insert({
      id: nftId,
      content_id: contentId,
      creator_id: user.id,
      owner_id: user.id,
      wallet_address: walletAddress,
      blockchain_id: `0x${Array(40)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`,
      edition: edition || 1,
      max_editions: edition || 1,
      price: price || 0,
      royalty_percentage: royaltyPercentage || 10,
      status: "minted",
    })

    if (nftError) throw nftError

    // Track transaction
    await fetch(`${request.nextUrl.origin}/api/analytics/transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        contentId,
        transactionType: "mint",
        amount: 0, // Minting itself doesn't cost (except gas fees)
        paymentMethod: "wallet",
      }),
    })

    return NextResponse.json({
      success: true,
      message: "NFT minted successfully",
      nftId,
      blockchainId: `0x${Array(40)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`,
    })
  } catch (error) {
    console.error("Error minting NFT:", error)
    return NextResponse.json({ error: "Failed to mint NFT" }, { status: 500 })
  }
}
