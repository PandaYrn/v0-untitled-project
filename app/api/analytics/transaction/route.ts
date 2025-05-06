import { type NextRequest, NextResponse } from "next/server"
import { trackTransaction } from "@/lib/analytics/track"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, contentId, eventId, transactionType, amount, currency, paymentMethod } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!transactionType) {
      return NextResponse.json({ error: "Transaction type is required" }, { status: 400 })
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 })
    }

    // Calculate platform fee and creator revenue
    const numericAmount = Number(amount)
    const platformFee = numericAmount * 0.05 // 5% platform fee
    const creatorRevenue = numericAmount - platformFee

    // Generate transaction ID if not provided
    const transactionId = body.transactionId || uuidv4()

    const result = await trackTransaction({
      transactionId,
      userId,
      contentId,
      eventId,
      transactionType,
      amount: numericAmount,
      currency: currency || "SUI",
      platformFee,
      creatorRevenue,
      paymentMethod,
      transactionStatus: "completed",
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in transaction API:", error)
    return NextResponse.json({ error: "Failed to track transaction" }, { status: 500 })
  }
}
