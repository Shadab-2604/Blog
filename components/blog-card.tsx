import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Calendar, Clock, ArrowRight, BookOpen, Eye, Heart } from "lucide-react"
import type { BlogPost } from "@/types"

interface BlogCardProps {
  post: BlogPost
}

// Helper to strip HTML tags from content for clean excerpt display
function getCleanExcerpt(content: string, excerpt?: string, maxLength = 140): string {
  if (excerpt) return excerpt
  if (!content) return ""
  const clean = content
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()

  if (clean.length <= maxLength) return clean
  return clean.substring(0, maxLength).trim() + "..."
}

// Estimate reading time in minutes
function getReadingTime(content: string): number {
  if (!content) return 1
  const wordCount = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length
  const minutes = Math.ceil(wordCount / 200)
  return Math.max(1, minutes)
}

export function BlogCard({ post }: BlogCardProps) {
  const excerpt = getCleanExcerpt(post.content, post.excerpt)
  const readingTime = getReadingTime(post.content)

  return (
    <Link href={`/blog/${post.slug || post._id}`} className="group block h-full focus:outline-none">
      <Card className="h-full flex flex-col overflow-hidden rounded-2xl border-border bg-card hover:border-indigo-500/40 dark:hover:border-indigo-400/40 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 transform group-hover:-translate-y-1">
        {/* Cover Image or Elegant Pattern Fallback */}
        <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-muted/40">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500/10 to-slate-500/10 dark:from-slate-900 dark:to-slate-800 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-500/15 dark:bg-indigo-400/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
                SHADAB.DEV
              </span>
            </div>
          )}

          {/* Reading Time Badge */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-medium bg-background/90 backdrop-blur-md text-foreground border border-border/80 shadow-xs flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>{readingTime} min read</span>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-3 leading-snug">
              {post.title}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {excerpt}
            </p>
          </div>
        </CardContent>

        {/* Card Footer with Meta & CTA */}
        <CardFooter className="px-6 pb-6 pt-0 border-t border-border/40 mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            {(post.views !== undefined && post.views > 0) && (
              <span className="flex items-center gap-1 text-[11px]">
                <Eye className="w-3 h-3 text-sky-500" />
                {post.views}
              </span>
            )}
            {(post.likes && post.likes.length > 0) && (
              <span className="flex items-center gap-1 text-[11px]">
                <Heart className="w-3 h-3 text-rose-500" />
                {post.likes.length}
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
            Read <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
