"use client"

import { useState, useEffect } from "react"
import { getBlogPosts } from "@/lib/api"
import { BlogCard } from "@/components/blog-card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

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
        setPosts(data)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortFilter) {
      case "new-old":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "old-new":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "a-z":
        return a.title.localeCompare(b.title)
      case "z-a":
        return b.title.localeCompare(a.title)
      default:
        return 0
    }
  })

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Blog Posts</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-md"
          />
          
          <Select value={sortFilter} onValueChange={setSortFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new-old">Newest to Oldest</SelectItem>
              <SelectItem value="old-new">Oldest to Newest</SelectItem>
              <SelectItem value="a-z">Title A-Z</SelectItem>
              <SelectItem value="z-a">Title Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Loading posts...</p>
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-xl text-gray-600">No matching posts found</h2>
          <p className="mt-2 text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPosts.map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </main>
  )
}