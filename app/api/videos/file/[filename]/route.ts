import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename
    const filePath = join(process.cwd(), "public", "uploads", filename)

    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}
