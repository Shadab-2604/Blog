"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { getSavedPosts } from "@/lib/api"
import type { BlogPost } from "@/types"
import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Bookmark, Calendar, Clock, ArrowRight, Trash2, BookOpen, Loader2 } from "lucide-react"

export default function SavedPostsPage() {
  const { user, isLoading, openAuthModal, toggleSave } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!user) {
      setFetching(false)
      return
    }

    const fetchSaved = async () => {
      try {
        const data = await getSavedPosts()
        setPosts(data)
      } catch (err) {
        console.error("Failed to load saved posts", err)
      } finally {
        setFetching(false)
      }
    }

    fetchSaved()
  }, [user])

  const handleRemove = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleSave(postId)
    setPosts((prev) => prev.filter((p) => p._id !== postId))
  }

  if (isLoading || fetching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm text-muted-foreground">Loading your saved articles...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="p-8 rounded-2xl bg-card border border-border shadow-lg space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
            <Bookmark className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Sign In to View Saved Articles</h1>
          <p className="text-sm text-muted-foreground">
            Guests have read-only access to blog posts. Sign in or register an account to bookmark articles and read them anytime.
          </p>
          <Button
            onClick={() => openAuthModal("login")}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md"
          >
            Sign In to Your Account
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40">
          <Bookmark className="w-3.5 h-3.5" />
          <span>Personal Reading List</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground">Saved Articles</h1>
        <p className="text-sm text-muted-foreground">
          Articles you've bookmarked to revisit, study, or enjoy later.
        </p>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-muted text-muted-foreground mx-auto flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No saved articles yet</h3>
          <p className="text-xs text-muted-foreground">
            Browse through our published insights and click the bookmark icon on any post to save it here.
          </p>
          <Link href="/">
            <Button variant="outline" className="text-xs border-border hover:border-indigo-500 hover:text-indigo-600">
              Explore Articles
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post._id}
              className="group relative flex flex-col rounded-2xl bg-card border border-border overflow-hidden hover:shadow-xl hover:border-indigo-500/40 transition-all duration-300"
            >
              {/* Cover */}
              {post.coverImage && (
                <div className="relative w-full h-48 bg-muted overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <button
                    onClick={(e) => handleRemove(e, post._id)}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-background/80 backdrop-blur-md text-muted-foreground hover:text-rose-500 hover:bg-background transition-all shadow-sm"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <h2 className="text-lg font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <Link
                    href={`/blog/${post.slug || post._id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:gap-2 transition-all"
                  >
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {!post.coverImage && (
                    <button
                      onClick={(e) => handleRemove(e, post._id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
