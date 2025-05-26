import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { users } from "../../../auth/register/route"
import { videos } from "../../route"

// In-memory database simulation
const gifts: any[] = []
let giftIdCounter = 1

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decoded = verifyToken(request)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid gift amount" }, { status: 400 })
    }

    const videoId = Number.parseInt(params.id)

    // Find video and creator
    const video = videos.find((v) => v.id === videoId)
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Find user (sender)
    const user = users.find((u) => u.id === decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check balance
    if (user.wallet < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Process gift
    user.wallet -= amount

    const gift = {
      id: giftIdCounter++,
      videoId,
      senderId: decoded.userId,
      creatorId: video.creatorId,
      amount,
      createdAt: new Date().toISOString(),
    }

    gifts.push(gift)

    return NextResponse.json({
      message: "Gift sent successfully",
      newBalance: user.wallet,
    })
  } catch (error) {
    console.error("Gift error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
