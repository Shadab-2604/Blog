"use client"

import { useState, useEffect } from "react"
import { getBlogPosts } from "@/lib/api"
import { BlogCard } from "@/components/blog-card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Search, Sparkles, BookOpen, ArrowUpDown, X } from "lucide-react"
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
    <main className="min-h-screen py-10 sm:py-16">
      {/* Hero Header Section */}
      <section className="container mx-auto px-4 sm:px-6 mb-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/40 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Engineering & Technology Insights
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Articles, Guides & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">
              Developer Insights
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Deep dives into modern full-stack web development, frontend frameworks, backend architecture, performance optimization, and practical engineering solutions.
          </p>
        </div>

        {/* Search & Sort Filter Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles by title, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-9 bg-background border-input focus-visible:ring-indigo-500 w-full"
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

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground whitespace-nowrap">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <Select value={sortFilter} onValueChange={setSortFilter}>
              <SelectTrigger className="w-[180px] bg-background border-input">
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
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{sortedPosts.length}</strong> {sortedPosts.length === 1 ? "article" : "articles"}
              {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
            </span>
          </div>
        )}
      </section>

      {/* Posts Grid Section */}
      <section className="container mx-auto px-4 sm:px-6">
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card p-5 space-y-4 animate-pulse"
              >
                <div className="h-44 bg-muted rounded-lg w-full" />
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
                <div className="h-4 bg-muted rounded w-1/3 pt-2" />
              </div>
            ))}
          </div>
        ) : sortedPosts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 px-4 rounded-2xl border border-dashed border-border bg-card/50 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">No articles found</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              {searchQuery
                ? `No posts matched "${searchQuery}". Try searching with different keywords.`
                : "No blog posts published yet. Stay tuned for upcoming engineering tutorials!"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-5 inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          /* Blog Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sortedPosts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}