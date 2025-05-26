import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { users } from "../auth/register/route"

// In-memory database simulation
const videos: any[] = []
const purchases: any[] = []

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

export async function GET(request: NextRequest) {
  try {
    const decoded = verifyToken(request)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = 10
    const offset = (page - 1) * limit

    // Get user's purchases
    const userPurchases = purchases.filter((p) => p.userId === decoded.userId)
    const purchasedVideoIds = userPurchases.map((p) => p.videoId)

    // Get videos with creator info and purchase status
    const videosWithDetails = videos
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit)
      .map((video) => {
        const creator = users.find((u) => u.id === video.creatorId)
        return {
          ...video,
          creator: {
            id: creator?.id,
            username: creator?.username,
          },
          isPurchased: purchasedVideoIds.includes(video.id) || video.price === 0,
        }
      })

    return NextResponse.json({
      videos: videosWithDetails,
      hasMore: videos.length > offset + limit,
    })
  } catch (error) {
    console.error("Get videos error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Export videos and purchases for other API routes
export { videos, purchases }
