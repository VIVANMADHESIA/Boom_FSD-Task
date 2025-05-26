"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Gift, Send } from "lucide-react"
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
}

interface Comment {
  id: string
  text: string
  user: {
    username: string
  }
  createdAt: string
}

interface User {
  id: string
  username: string
  wallet: number
}

export default function VideoPage() {
  const [video, setVideo] = useState<Video | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [newComment, setNewComment] = useState("")
  const [giftAmount, setGiftAmount] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/")
      return
    }

    setUser(JSON.parse(userData))
    fetchVideo()
    fetchComments()
  }, [params.id, router])

  const fetchVideo = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/videos/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setVideo(data.video)
      } else {
        toast({ title: "Error", description: "Video not found", variant: "destructive" })
        router.push("/feed")
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load video", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/videos/${params.id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error("Failed to fetch comments")
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/videos/${params.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments((prev) => [data.comment, ...prev])
        setNewComment("")
        toast({ title: "Comment added!" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add comment", variant: "destructive" })
    }
  }

  const handleGift = async () => {
    const amount = Number.parseInt(giftAmount)
    if (!amount || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" })
      return
    }

    if (!user || user.wallet < amount) {
      toast({ title: "Insufficient balance", description: "Please add money to your wallet", variant: "destructive" })
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/videos/${params.id}/gift`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser((prev) => (prev ? { ...prev, wallet: data.newBalance } : null))
        setGiftAmount("")
        toast({ title: "Gift sent!", description: `You gifted ₹${amount} to ${video?.creator.username}` })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send gift", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading video...</p>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Video not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button onClick={() => router.push("/feed")} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-medium">Wallet: ₹{user?.wallet || 0}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {video.type === "short-form" && video.videoFile ? (
                  <video
                    src={`/api/videos/file/${video.videoFile}`}
                    controls
                    className="w-full aspect-video rounded-t-lg"
                  />
                ) : (
                  <div className="aspect-video bg-black rounded-t-lg flex items-center justify-center">
                    {video.videoUrl ? (
                      <iframe
                        src={video.videoUrl.replace("watch?v=", "embed/")}
                        className="w-full h-full rounded-t-lg"
                        allowFullScreen
                      />
                    ) : (
                      <p className="text-white">Video player placeholder</p>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                      <p className="text-gray-600 mb-4">{video.description}</p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
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

                        {video.price > 0 && (
                          <Badge variant="outline" className="text-green-600">
                            ₹{video.price}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gift Creator Section */}
                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Gift className="h-5 w-5" />
                        Gift the Creator
                      </CardTitle>
                      <CardDescription>Show your appreciation to {video.creator.username}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Select onValueChange={setGiftAmount}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Amount" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">₹10</SelectItem>
                            <SelectItem value="50">₹50</SelectItem>
                            <SelectItem value="100">₹100</SelectItem>
                            <SelectItem value="500">₹500</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Custom amount"
                          value={giftAmount}
                          onChange={(e) => setGiftAmount(e.target.value)}
                          type="number"
                          min="1"
                        />
                        <Button onClick={handleGift} disabled={!giftAmount}>
                          <Gift className="h-4 w-4 mr-2" />
                          Send Gift
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comments Section */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment */}
                <form onSubmit={handleAddComment} className="space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <Button type="submit" size="sm" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </form>

                {/* Comments List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {comment.user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.user.username}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
