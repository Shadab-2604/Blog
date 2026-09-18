"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, Calendar, Clock, Eye } from "lucide-react"
import Image from "next/image"

function PreviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const postData = searchParams.get("data")
    if (postData) {
      try {
        setPost(JSON.parse(decodeURIComponent(postData)))
      } catch (err) {
        console.error("Failed to parse preview data", err)
        setError("Failed to parse preview data. Please return to the editor.")
      }
    } else {
      setError("No preview data provided.")
    }
  }, [searchParams])

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center justify-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium text-sm">{error}</p>
        </div>
        <Button onClick={() => router.back()} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Go Back to Editor
        </Button>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        <p>Loading preview...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-border hover:border-indigo-500 hover:text-indigo-600 gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Editor
          </Button>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Eye className="w-4 h-4" />
            <span>Preview Mode — Not yet published</span>
          </div>
        </div>

        {/* Article Preview Container */}
        <article className="rounded-2xl border border-border bg-card p-6 sm:p-12 shadow-sm">
          {/* Header */}
          <header className="mb-8 space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.2]">
              {post.title || "Untitled Post"}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2 border-b border-border pb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  SS
                </div>
                <span className="font-medium text-foreground">Shadab Shaikh</span>
              </div>

              <span className="text-border">•</span>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{formatDate(new Date().toISOString())}</span>
              </div>

              <span className="text-border">•</span>

              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  post.published
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                }`}
              >
                {post.published ? "Marked as Published" : "Draft Status"}
              </span>
            </div>
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative w-full h-[280px] sm:h-[420px] mb-10 rounded-xl overflow-hidden border border-border bg-muted/20">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Body Content */}
          <div
            className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed
              prose-headings:font-bold prose-headings:text-foreground dark:prose-headings:text-foreground
              prose-strong:text-foreground dark:prose-strong:text-white prose-strong:font-bold
              prose-b:text-foreground dark:prose-b:text-white prose-b:font-bold
              prose-p:leading-8 prose-p:text-foreground/90 dark:prose-p:text-foreground/90
              prose-li:text-foreground/90 dark:prose-li:text-foreground/90
              prose-a:text-indigo-600 dark:prose-a:text-indigo-400
              prose-blockquote:border-l-4 prose-blockquote:border-indigo-600 dark:prose-blockquote:border-indigo-400
              prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content || "<p><em>No content written yet...</em></p>" }}
          />
        </article>
      </div>
    </div>
  )
}

export function PreviewPostContent() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Loading preview...
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  )
}
