"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UploadPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    price: 0,
    videoUrl: "",
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const submitData = new FormData()

      submitData.append("title", formData.title)
      submitData.append("description", formData.description)
      submitData.append("type", formData.type)
      submitData.append("price", formData.price.toString())

      if (formData.type === "short-form" && videoFile) {
        submitData.append("videoFile", videoFile)
      } else if (formData.type === "long-form") {
        submitData.append("videoUrl", formData.videoUrl)
      }

      const response = await fetch("/api/videos/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      })

      if (response.ok) {
        toast({ title: "Video uploaded successfully!" })
        router.push("/feed")
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Upload failed", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast({ title: "Error", description: "File size must be less than 10MB", variant: "destructive" })
        return
      }
      if (!file.type.includes("mp4")) {
        toast({ title: "Error", description: "Only MP4 files are allowed", variant: "destructive" })
        return
      }
      setVideoFile(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button onClick={() => router.push("/feed")} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Upload Video
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload New Video</CardTitle>
            <CardDescription>Share your content with the Boom community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter video title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your video"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Video Type</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select video type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short-form">Short-Form</SelectItem>
                    <SelectItem value="long-form">Long-Form</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === "short-form" && (
                <div className="space-y-2">
                  <Label htmlFor="video-file">Video File (MP4, max 10MB)</Label>
                  <Input id="video-file" type="file" accept=".mp4" onChange={handleFileChange} required />
                  {videoFile && (
                    <p className="text-sm text-gray-600">
                      Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              )}

              {formData.type === "long-form" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="video-url">Video URL</Label>
                    <Input
                      id="video-url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      placeholder="0 for free, or set a price"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-sm text-gray-500">
                      Set to 0 for free content, or add a price for premium content
                    </p>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !formData.type}>
                {isLoading ? (
                  "Uploading..."
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
