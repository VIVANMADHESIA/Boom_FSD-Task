import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { writeFile } from "fs/promises"
import { join } from "path"
import { videos } from "../route"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
let videoIdCounter = 1

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

    const formData = await request.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const type = formData.get("type") as string
    const price = Number.parseInt(formData.get("price") as string) || 0
    const videoUrl = formData.get("videoUrl") as string
    const videoFile = formData.get("videoFile") as File

    // Validation
    if (!title || !description || !type) {
      return NextResponse.json({ error: "Title, description, and type are required" }, { status: 400 })
    }

    if (type === "short-form" && !videoFile) {
      return NextResponse.json({ error: "Video file is required for short-form videos" }, { status: 400 })
    }

    if (type === "long-form" && !videoUrl) {
      return NextResponse.json({ error: "Video URL is required for long-form videos" }, { status: 400 })
    }

    let savedFileName = null

    // Handle file upload for short-form videos
    if (type === "short-form" && videoFile) {
      const bytes = await videoFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Create unique filename
      savedFileName = `${Date.now()}-${videoFile.name}`
      const path = join(process.cwd(), "public", "uploads", savedFileName)

      // Save file
      await writeFile(path, buffer)
    }

    // Create video record
    const video = {
      id: videoIdCounter++,
      title,
      description,
      type,
      price: type === "long-form" ? price : 0,
      videoUrl: type === "long-form" ? videoUrl : null,
      videoFile: savedFileName,
      creatorId: decoded.userId,
      createdAt: new Date().toISOString(),
    }

    videos.push(video)

    return NextResponse.json({
      message: "Video uploaded successfully",
      video,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
