import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { users } from "../../auth/register/route"
import { videos, purchases } from "../route"

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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decoded = verifyToken(request)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const videoId = Number.parseInt(params.id)
    const video = videos.find((v) => v.id === videoId)

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Get creator info
    const creator = users.find((u) => u.id === video.creatorId)

    // Check if user has purchased this video
    const hasPurchased = purchases.some((p) => p.userId === decoded.userId && p.videoId === videoId)

    const videoWithDetails = {
      ...video,
      creator: {
        id: creator?.id,
        username: creator?.username,
      },
      isPurchased: hasPurchased || video.price === 0,
    }

    return NextResponse.json({ video: videoWithDetails })
  } catch (error) {
    console.error("Get video error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
