import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Calendar, Clock, ArrowUpRight, BookOpen, Eye, Heart } from "lucide-react"
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
      <Card className="h-full flex flex-col overflow-hidden rounded-2xl border border-border bg-card hover:border-foreground/25 hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5">
        {/* Cover Image or Editorial Fallback */}
        <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-secondary border-b border-border">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-dot-grid p-6 text-center">
              <div className="w-11 h-11 rounded-xl border border-border bg-background flex items-center justify-center text-foreground mb-2.5 shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-mono text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
                SHADAB.DEV
              </span>
            </div>
          )}

          {/* Reading Time Badge */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md font-mono text-[11px] font-medium bg-background/90 backdrop-blur-md text-foreground border border-border flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span>{readingTime} min</span>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground group-hover:text-foreground/80 transition-colors line-clamp-2 mb-2.5 leading-snug">
              {post.title}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {excerpt}
            </p>
          </div>
        </CardContent>

        {/* Card Footer with Meta & CTA */}
        <CardFooter className="px-6 py-4 border-t border-border mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            {(post.views !== undefined && post.views > 0) && (
              <span className="flex items-center gap-1 text-[11px] font-mono">
                <Eye className="w-3 h-3" />
                {post.views}
              </span>
            )}
            {(post.likes && post.likes.length > 0) && (
              <span className="flex items-center gap-1 text-[11px] font-mono">
                <Heart className="w-3 h-3" />
                {post.likes.length}
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1 font-medium text-foreground group-hover:translate-x-0.5 transition-transform">
            Read <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
