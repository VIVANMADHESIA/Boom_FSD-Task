"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Play, Upload, Wallet, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Video {
  id: string
  title: string
  description: string
  type: "short-form" | "long-form"
  price: number
  creator: {
    id: string
    username: string
  }
  videoUrl?: string
  videoFile?: string
  createdAt: string
  isPurchased?: boolean
}

interface User {
  id: string
  username: string
  email: string
  wallet: number
}

export default function FeedPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/")
      return
    }

    setUser(JSON.parse(userData))
    fetchVideos()
  }, [router])

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/videos?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setVideos((prev) => (page === 1 ? data.videos : [...prev, ...data.videos]))
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch videos", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchase = async (videoId: string, price: number) => {
    if (!user || user.wallet < price) {
      toast({ title: "Insufficient balance", description: "Please add money to your wallet", variant: "destructive" })
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/videos/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ videoId }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser((prev) => (prev ? { ...prev, wallet: data.newBalance } : null))
        setVideos((prev) => prev.map((video) => (video.id === videoId ? { ...video, isPurchased: true } : video)))
        toast({ title: "Purchase successful!", description: `You can now watch this video` })
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Purchase failed", variant: "destructive" })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  const loadMore = () => {
    setPage((prev) => prev + 1)
    fetchVideos()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading your feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            BOOM Feed
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="font-medium">₹{user?.wallet || 0}</span>
            </div>
            <Button onClick={() => router.push("/upload")} size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{video.creator.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{video.creator.username}</p>
                      <p className="text-sm text-gray-500">{new Date(video.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={video.type === "short-form" ? "default" : "secondary"}>
                    {video.type === "short-form" ? "Short" : "Long-form"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{video.title}</h3>
                    <p className="text-gray-600">{video.description}</p>
                  </div>

                  {video.type === "short-form" && video.videoFile && (
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                      <video
                        src={`/api/videos/file/${video.videoFile}`}
                        controls
                        className="w-full h-full object-contain"
                        muted
                      />
                    </div>
                  )}

                  {video.type === "long-form" && (
                    <div className="bg-gray-100 rounded-lg p-4 aspect-video flex items-center justify-center">
                      <div className="text-center">
                        <Play className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">Long-form video thumbnail</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {video.type === "long-form" && video.price > 0 && !video.isPurchased ? (
                      <Button
                        onClick={() => handlePurchase(video.id, video.price)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Buy for ₹{video.price}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => router.push(`/video/${video.id}`)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {video.type === "short-form" ? "Watch" : "Watch"}
                      </Button>
                    )}

                    {video.type === "long-form" && video.price > 0 && (
                      <Badge variant="outline" className="text-green-600">
                        ₹{video.price}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {videos.length > 0 && (
          <div className="text-center mt-8">
            <Button onClick={loadMore} variant="outline">
              Load More Videos
            </Button>
          </div>
        )}

        {videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No videos yet. Be the first to upload!</p>
            <Button onClick={() => router.push("/upload")} className="mt-4">
              <Upload className="h-4 w-4 mr-2" />
              Upload Video
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
