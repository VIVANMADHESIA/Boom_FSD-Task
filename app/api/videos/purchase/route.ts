import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { users } from "../../auth/register/route"
import { videos, purchases } from "../route"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
let purchaseIdCounter = 1

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(request)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { videoId } = await request.json()

    // Find video
    const video = videos.find((v) => v.id === Number.parseInt(videoId))
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Find user
    const user = users.find((u) => u.id === decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if already purchased
    const existingPurchase = purchases.find(
      (p) => p.userId === decoded.userId && p.videoId === Number.parseInt(videoId),
    )
    if (existingPurchase) {
      return NextResponse.json({ error: "Already purchased" }, { status: 400 })
    }

    // Check balance
    if (user.wallet < video.price) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Process purchase
    user.wallet -= video.price

    const purchase = {
      id: purchaseIdCounter++,
      userId: decoded.userId,
      videoId: Number.parseInt(videoId),
      amount: video.price,
      createdAt: new Date().toISOString(),
    }

    purchases.push(purchase)

    return NextResponse.json({
      message: "Purchase successful",
      newBalance: user.wallet,
    })
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
