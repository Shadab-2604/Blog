export const dynamic = "force-dynamic"

import { getBlogPostBySlug, getBlogPostById } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, ExternalLink, Github, Instagram, Eye, Heart } from "lucide-react"
import { BlogPostInteractions } from "@/components/blog-post-interactions"

// Estimate reading time in minutes
function getReadingTime(content: string): number {
  if (!content) return 1
  const wordCount = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length
  const minutes = Math.ceil(wordCount / 200)
  return Math.max(1, minutes)
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let post = await getBlogPostBySlug(slug)
  if (!post) {
    try {
      post = await getBlogPostById(slug)
    } catch {
      post = null
    }
  }

  if (!post) {
    notFound()
  }

  const readingTime = getReadingTime(post.content)
  const authorName = (typeof post.author === "object" && post.author?.name) ? post.author.name : "Shadab Shaikh"
  const authorInitial = authorName.substring(0, 2).toUpperCase()

  return (
    <div className="min-h-screen py-10 sm:py-16">
      <article className="container mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Navigation back */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all articles
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-10 space-y-4">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.2]">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2 border-b border-border pb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {authorInitial}
              </div>
              <span className="font-medium text-foreground">{authorName}</span>
            </div>

            <span className="text-border">•</span>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{formatDate(post.createdAt)}</span>
            </div>

            <span className="text-border">•</span>

            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative w-full h-[280px] sm:h-[440px] mb-12 rounded-2xl overflow-hidden border border-border bg-muted/20 shadow-md">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
              unoptimized
            />
          </div>
        )}

        {/* Article Body with High-Contrast Prose */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground dark:prose-headings:text-foreground
            prose-strong:text-foreground dark:prose-strong:text-white prose-strong:font-bold
            prose-b:text-foreground dark:prose-b:text-white prose-b:font-bold
            prose-p:leading-8 prose-p:text-foreground/90 dark:prose-p:text-foreground/90
            prose-li:text-foreground/90 dark:prose-li:text-foreground/90
            prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:font-semibold hover:prose-a:underline
            prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:text-slate-100 prose-pre:border prose-pre:border-slate-800
            prose-blockquote:border-l-4 prose-blockquote:border-indigo-600 dark:prose-blockquote:border-indigo-400 prose-blockquote:text-muted-foreground prose-blockquote:italic
            prose-img:rounded-xl prose-img:shadow-sm"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Interactive Bar (Likes, Bookmarks, Views) & Real-time Comments */}
        <BlogPostInteractions
          postId={post._id}
          initialLikes={post.likes || []}
          initialViews={post.views || 0}
          postSlug={post.slug}
          postTitle={post.title}
        />

        {/* Author Bio Card */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                {authorInitial}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{authorName}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Full Stack Engineer & Tech Enthusiast. Building scalable web experiences.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://shadab-dev.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                View Portfolio <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com/Shadab-2604"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-lg text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-muted transition-colors border border-border"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/_shad.dev_"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-lg text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-muted transition-colors border border-border"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
