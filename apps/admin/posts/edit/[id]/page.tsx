"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BlogEditor } from "@/components/blog-editor"
import { getBlogPostById, checkAuth } from "@/lib/api"
import type { BlogPost } from "@/types"

export default function EditPost({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = await checkAuth()
      if (!isAuthenticated) {
        router.push("/admin/login")
      } else {
        fetchPost()
      }
    }

    checkAuthentication()
  }, [router, params.id])

  const fetchPost = async () => {
    try {
      const data = await getBlogPostById(params.id)
      setPost(data)
    } catch (err) {
      setError("Failed to fetch post")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">Post not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
      <BlogEditor post={post} />
    </div>
  )
}

