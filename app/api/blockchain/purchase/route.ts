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
    const { itemId, itemType, walletAddress, price } = body

    if (!itemId || !itemType || !walletAddress || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate item type
    if (!["content", "nft", "ticket"].includes(itemType)) {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 })
    }

    // In a real implementation, this would call the Sui blockchain
    // For now, we'll simulate the purchase process

    let sellerId, contentId

    // Handle different item types
    if (itemType === "content") {
      // Get content details
      const { data: content } = await supabase.from("content").select("id, creator_id").eq("id", itemId).single()

      if (!content) {
        return NextResponse.json({ error: "Content not found" }, { status: 404 })
      }

      sellerId = content.creator_id
      contentId = content.id

      // Create purchase record
      const { error: purchaseError } = await supabase.from("purchases").insert({
        id: uuidv4(),
        user_id: user.id,
        content_id: itemId,
        price,
        transaction_id: `0x${Array(40)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("")}`,
      })

      if (purchaseError) throw purchaseError
    } else if (itemType === "nft") {
      // Get NFT details
      const { data: nft } = await supabase
        .from("nfts")
        .select("id, content_id, creator_id, owner_id")
        .eq("id", itemId)
        .single()

      if (!nft) {
        return NextResponse.json({ error: "NFT not found" }, { status: 404 })
      }

      sellerId = nft.owner_id
      contentId = nft.content_id

      // Update NFT ownership
      const { error: nftError } = await supabase
        .from("nfts")
        .update({
          owner_id: user.id,
          wallet_address: walletAddress,
          last_sold_price: price,
          last_sold_at: new Date().toISOString(),
        })
        .eq("id", itemId)

      if (nftError) throw nftError

      // Calculate royalty for creator
      const royaltyAmount = price * 0.1 // Assuming 10% royalty

      // Track royalty payment
      if (nft.creator_id !== nft.owner_id) {
        await fetch(`${request.nextUrl.origin}/api/analytics/transaction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: nft.creator_id,
            contentId: nft.content_id,
            transactionType: "royalty",
            amount: royaltyAmount,
            paymentMethod: "wallet",
          }),
        })
      }
    } else if (itemType === "ticket") {
      // Get event details
      const { data: event } = await supabase
        .from("events")
        .select("id, creator_id, content_id")
        .eq("id", itemId)
        .single()

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }

      sellerId = event.creator_id
      contentId = event.content_id

      // Create ticket purchase
      const { error: ticketError } = await supabase.from("tickets").insert({
        id: uuidv4(),
        event_id: itemId,
        user_id: user.id,
        price,
        status: "active",
        transaction_id: `0x${Array(40)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("")}`,
      })

      if (ticketError) throw ticketError
    }

    // Calculate platform fee
    const platformFee = price * 0.05 // 5% platform fee
    const sellerAmount = price - platformFee

    // Track transaction
    await fetch(`${request.nextUrl.origin}/api/analytics/transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        contentId,
        transactionType: "purchase",
        amount: price,
        platformFee,
        creatorRevenue: sellerAmount,
        paymentMethod: "wallet",
      }),
    })

    return NextResponse.json({
      success: true,
      message: `${itemType} purchased successfully`,
      transactionId: `0x${Array(40)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`,
    })
  } catch (error) {
    console.error("Error processing purchase:", error)
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 })
  }
}
