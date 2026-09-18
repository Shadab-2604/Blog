"use client"

import React, { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  toggleLike as apiToggleLike,
  incrementView,
  getCommentsByPost,
  createComment as apiCreateComment,
  deleteComment as apiDeleteComment,
} from "@/lib/api"
import { getSocket } from "@/lib/socket"
import type { Comment } from "@/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Heart,
  Bookmark,
  MessageSquare,
  Eye,
  Send,
  Trash2,
  Share2,
  Lock,
  Sparkles,
  Loader2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

interface BlogPostInteractionsProps {
  postId: string
  initialLikes?: string[]
  initialViews?: number
  postSlug: string
  postTitle: string
}

export function BlogPostInteractions({
  postId,
  initialLikes = [],
  initialViews = 0,
  postSlug,
  postTitle,
}: BlogPostInteractionsProps) {
  const { user, role, openAuthModal, isSaved, toggleSave } = useAuth()

  // Likes state
  const [likes, setLikes] = useState<string[]>(initialLikes)
  const isLiked = user ? likes.includes(user._id) : false
  const [isLiking, setIsLiking] = useState(false)

  // Views state
  const [views, setViews] = useState<number>(initialViews)
  const viewCountedRef = useRef(false)

  // Comments state
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const isSubmittingRef = useRef(false)
  const [isLoadingComments, setIsLoadingComments] = useState(true)

  // Helper to normalize IDs to string
  const normalizeId = (id: any): string => {
    if (!id) return ""
    if (typeof id === "string") return id
    if (typeof id === "object") {
      return id._id ? String(id._id) : id.id ? String(id.id) : String(id)
    }
    return String(id)
  }

  // Increment view count on mount
  useEffect(() => {
    if (viewCountedRef.current) return
    viewCountedRef.current = true

    const recordView = async () => {
      try {
        const res = await incrementView(postId)
        if (res?.views) {
          setViews(res.views)
        }
      } catch (err) {
        console.error("Failed to record view", err)
      }
    }
    recordView()
  }, [postId])

  // Fetch comments and attach socket listeners
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getCommentsByPost(postId)
        if (Array.isArray(data)) {
          // Strictly deduplicate by _id
          const map = new Map<string, Comment>()
          data.forEach((c) => {
            if (c?._id) map.set(String(c._id), c)
          })
          setComments(Array.from(map.values()))
        }
      } catch (err) {
        console.error("Failed to fetch comments", err)
      } finally {
        setIsLoadingComments(false)
      }
    }

    fetchComments()

    const socket = getSocket()
    socket.emit("join_post", postId)

    const handleNewComment = (newComment: Comment) => {
      if (!newComment?._id) return
      const commentPostId = normalizeId(newComment.post)
      const currentPostId = normalizeId(postId)

      if (!commentPostId || commentPostId === currentPostId) {
        setComments((prev) => {
          if (prev.some((c) => String(c._id) === String(newComment._id))) {
            return prev
          }
          return [newComment, ...prev]
        })
      }
    }

    const handleCommentDeleted = (data: { commentId: string; postId: string }) => {
      if (normalizeId(data.postId) === normalizeId(postId)) {
        setComments((prev) => prev.filter((c) => String(c._id) !== String(data.commentId)))
      }
    }

    const handlePostLiked = (data: { postId: string; likesCount: number; likes: string[] }) => {
      if (normalizeId(data.postId) === normalizeId(postId)) {
        setLikes(data.likes)
      }
    }

    socket.on("new_comment", handleNewComment)
    socket.on("comment_deleted", handleCommentDeleted)
    socket.on("post_liked", handlePostLiked)

    return () => {
      socket.off("new_comment", handleNewComment)
      socket.off("comment_deleted", handleCommentDeleted)
      socket.off("post_liked", handlePostLiked)
    }
  }, [postId])

  // Handle Like
  const handleLike = async () => {
    if (!user) {
      toast.info("Please sign in to like this article", {
        description: "Guests have read-only access. Create an account in seconds!",
      })
      openAuthModal("login")
      return
    }

    if (isLiking) return
    setIsLiking(true)

    // Optimistic UI update
    const prevLikes = [...likes]
    const alreadyLiked = prevLikes.includes(user._id)
    const optimisticLikes = alreadyLiked
      ? prevLikes.filter((id) => id !== user._id)
      : [...prevLikes, user._id]
    setLikes(optimisticLikes)

    try {
      const res = await apiToggleLike(postId)
      setLikes(res.likes)
      if (res.liked) {
        toast.success("Liked article!")
      }
    } catch (err) {
      setLikes(prevLikes)
      toast.error("Failed to update like")
    } finally {
      setIsLiking(false)
    }
  }

  // Handle Bookmark
  const handleBookmark = async () => {
    if (!user) {
      toast.info("Please sign in to save articles", {
        description: "Create an account to build your personal reading list.",
      })
      openAuthModal("login")
      return
    }
    await toggleSave(postId)
  }

  // Handle Share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          url: window.location.href,
        })
      } catch {
        // Ignored
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  // Handle Comment Submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      openAuthModal("login")
      return
    }

    const trimmed = commentText.trim()
    if (!trimmed) return

    // Synchronous mutex lock to strictly prevent multiple submissions
    if (isSubmittingRef.current || isSubmittingComment) return
    isSubmittingRef.current = true
    setIsSubmittingComment(true)

    try {
      const newComment = await apiCreateComment(postId, trimmed)
      // Clear input immediately so user cannot double-submit
      setCommentText("")
      if (newComment && newComment._id) {
        setComments((prev) => {
          // If socket already added it, do not duplicate
          if (prev.some((c) => String(c._id) === String(newComment._id))) {
            return prev
          }
          return [newComment, ...prev]
        })
      }
      toast.success("Comment posted!")
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to post comment"
      toast.error(msg)
    } finally {
      setIsSubmittingComment(false)
      isSubmittingRef.current = false
    }
  }

  // Handle Comment Delete
  const handleDeleteComment = async (commentId: string) => {
    try {
      await apiDeleteComment(commentId)
      setComments((prev) => prev.filter((c) => String(c._id) !== String(commentId)))
      toast.info("Comment removed")
    } catch (err) {
      toast.error("Could not delete comment")
    }
  }

  const saved = isSaved(postId)

  // Guarantee strictly unique comments by _id for rendering
  const uniqueComments = React.useMemo(() => {
    const map = new Map<string, Comment>()
    for (const c of comments) {
      if (c && c._id) {
        map.set(String(c._id), c)
      }
    }
    return Array.from(map.values())
  }, [comments])

  return (
    <div className="mt-12 space-y-12">
      {/* ACTION BAR: Views, Likes, Saves, Share */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-2">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`gap-2 rounded-xl transition-all duration-200 ${
              isLiked
                ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 hover:text-rose-600"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            aria-label="Like article"
          >
            <Heart
              className={`h-4 w-4 transition-transform duration-200 ${
                isLiked ? "fill-rose-500 text-rose-500 scale-110" : ""
              }`}
            />
            <span className="text-xs font-semibold">{likes.length}</span>
          </Button>

          {/* Bookmark Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={`gap-2 rounded-xl transition-all duration-200 ${
              saved
                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            aria-label="Save article"
          >
            <Bookmark
              className={`h-4 w-4 transition-transform duration-200 ${
                saved ? "fill-indigo-600 dark:fill-indigo-400 text-indigo-600 dark:text-indigo-400 scale-110" : ""
              }`}
            />
            <span className="text-xs font-semibold">{saved ? "Saved" : "Save"}</span>
          </Button>

          {/* Comment Count Indicator */}
          <a
            href="#comments"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{uniqueComments.length}</span>
          </a>
        </div>

        {/* Right side: Views count and Share */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{views} views</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 text-xs rounded-xl border-border hover:border-indigo-500 hover:text-indigo-600"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        </div>
      </div>

      {/* COMMENTS SECTION */}
      <section id="comments" className="space-y-6 pt-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-foreground">
              Comments <span className="text-muted-foreground text-sm font-normal">({uniqueComments.length})</span>
            </h2>
          </div>
        </div>

        {/* Comment Composer or Guest CTA */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="h-9 w-9 border border-border shrink-0">
                <AvatarImage src={user.avatar} alt={user.name || user.username} />
                <AvatarFallback className="bg-indigo-600/10 text-indigo-600 text-xs font-bold">
                  {(user.name || user.username).substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts on this article..."
                  rows={3}
                  className="w-full resize-none bg-card border-border focus-visible:ring-indigo-500 text-sm"
                  required
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmittingComment || !commentText.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs shadow-xs"
                  >
                    {isSubmittingComment ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-6 rounded-2xl bg-muted/40 border border-border text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Guest Reading Mode</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Sign in or create an account to leave comments, like articles, and bookmark them for later.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => openAuthModal("login")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sign In to Join Discussion
            </Button>
          </div>
        )}

        {/* Comment List */}
        <div className="space-y-4 pt-2">
          {isLoadingComments ? (
            <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              Loading comments...
            </div>
          ) : uniqueComments.length === 0 ? (
            <div className="py-10 text-center rounded-xl border border-dashed border-border/80 text-muted-foreground text-sm">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            uniqueComments.map((comment) => {
              const isAuthor =
                user &&
                comment.user &&
                (String(user._id) === String((comment.user as any)._id) ||
                  String(user._id) === String(comment.user))
              const canDelete = isAuthor || role === "admin"
              const authorName = comment.user?.name || comment.user?.username || "Anonymous"
              const authorUsername = comment.user?.username || "user"
              const authorAvatar = comment.user?.avatar

              return (
                <div
                  key={String(comment._id)}
                  className="p-4 rounded-xl bg-card border border-border/80 space-y-2 shadow-xs transition-colors hover:border-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage src={authorAvatar} alt={authorName} />
                        <AvatarFallback className="bg-muted text-[10px] font-bold">
                          {authorName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground">{authorName}</span>
                          <span className="text-[11px] text-muted-foreground">@{authorUsername}</span>
                          {comment.user?.role === "admin" && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground/70">
                          {comment.createdAt
                            ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                            : "just now"}
                        </span>
                      </div>
                    </div>

                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteComment(comment._id)}
                        className="h-7 w-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg"
                        title="Delete comment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-foreground/90 pl-10 whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
