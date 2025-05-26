import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { users } from "../../../auth/register/route"

// In-memory database simulation
const comments: any[] = []
let commentIdCounter = 1

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

    // Get comments for this video with user info
    const videoComments = comments
      .filter((c) => c.videoId === videoId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((comment) => {
        const user = users.find((u) => u.id === comment.userId)
        return {
          ...comment,
          user: {
            username: user?.username,
          },
        }
      })

    return NextResponse.json({ comments: videoComments })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decoded = verifyToken(request)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 })
    }

    const videoId = Number.parseInt(params.id)

    const comment = {
      id: commentIdCounter++,
      videoId,
      userId: decoded.userId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    }

    comments.push(comment)

    // Return comment with user info
    const user = users.find((u) => u.id === decoded.userId)
    const commentWithUser = {
      ...comment,
      user: {
        username: user?.username,
      },
    }

    return NextResponse.json({
      message: "Comment added successfully",
      comment: commentWithUser,
    })
  } catch (error) {
    console.error("Add comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
