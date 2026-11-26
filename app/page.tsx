"use client"

import { useState, useEffect } from "react"
import { getBlogPosts } from "@/lib/api"
import { BlogCard } from "@/components/blog-card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Search, BookOpen, ArrowUpDown, X } from "lucide-react"
import type { BlogPost } from "@/types"

export const dynamic = "force-dynamic"

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortFilter, setSortFilter] = useState("new-old")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getBlogPosts()
        if (Array.isArray(data)) {
          setPosts(data)
        } else {
          setPosts([])
        }
      } catch (error) {
        console.error("Error fetching posts:", error)
        setPosts([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const filteredPosts = posts.filter((post) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    const titleMatch = post.title?.toLowerCase().includes(query) || false
    const contentMatch = post.content?.toLowerCase().includes(query) || false
    const slugMatch = post.slug?.toLowerCase().includes(query) || false
    return titleMatch || contentMatch || slugMatch
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortFilter) {
      case "new-old":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      case "old-new":
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      case "a-z":
        return (a.title || "").localeCompare(b.title || "")
      case "z-a":
        return (b.title || "").localeCompare(a.title || "")
      default:
        return 0
    }
  })

  return (
    <main className="min-h-screen py-12 sm:py-16 relative">
      {/* Subtle Dot-Grid Header Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-dot-grid opacity-45 [mask-image:linear-gradient(to_bottom,black_20%,transparent_100%)]"
      />

      {/* Hero Header Section */}
      <section className="container mx-auto px-4 sm:px-6 max-w-5xl mb-12 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border font-mono text-[11px] font-medium text-muted-foreground mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Engineering &amp; Security Insights
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4 leading-[1.12]">
            Articles, Guides &amp;{' '}
            <span className="underline decoration-border decoration-2 underline-offset-8">
              Developer Notes
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Deep dives into cybersecurity, full-stack MERN development, system
            architecture, and practical engineering solutions.
          </p>
        </div>

        {/* Search & Sort Filter Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles by title, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-9 bg-background border-border rounded-xl w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <Select value={sortFilter} onValueChange={setSortFilter}>
              <SelectTrigger className="w-[170px] bg-background border-border rounded-xl">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border shadow-md">
                <SelectItem value="new-old">Newest First</SelectItem>
                <SelectItem value="old-new">Oldest First</SelectItem>
                <SelectItem value="a-z">Title (A - Z)</SelectItem>
                <SelectItem value="z-a">Title (Z - A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Counter */}
        {!isLoading && (
          <div className="mt-4 flex items-center justify-between font-mono text-xs text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{sortedPosts.length}</strong> {sortedPosts.length === 1 ? "article" : "articles"}
              {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
            </span>
          </div>
        )}
      </section>

      {/* Posts Grid Section */}
      <section className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card p-5 space-y-4 animate-pulse"
              >
                <div className="h-44 bg-secondary rounded-xl w-full" />
                <div className="h-6 bg-secondary rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-secondary rounded w-full" />
                  <div className="h-4 bg-secondary rounded w-5/6" />
                </div>
                <div className="h-4 bg-secondary rounded w-1/3 pt-2" />
              </div>
            ))}
          </div>
        ) : sortedPosts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 px-4 rounded-2xl border border-dashed border-border bg-card max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl border border-border bg-background text-foreground mx-auto flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">No articles found</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              {searchQuery
                ? `No posts matched "${searchQuery}". Try searching with different keywords.`
                : "No blog posts published yet. Stay tuned for upcoming engineering tutorials!"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-5 inline-flex items-center px-4 py-2 rounded-xl text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          /* Blog Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPosts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
