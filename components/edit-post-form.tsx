"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BlogEditor } from "@/components/blog-editor"
import { getBlogPostById, checkAuth } from "@/lib/api"
import type { BlogPost } from "@/types"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EditPostFormProps {
  id: string
}

export function EditPostForm({ id }: EditPostFormProps) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuthenticated = await checkAuth()
        if (!isAuthenticated) {
          router.push("/admin/login")
        } else {
          fetchPost()
        }
      } catch (err) {
        setError("Authentication check failed. Please try logging in again.")
        setLoading(false)
      }
    }

    checkAuthentication()
  }, [router, id])

  const fetchPost = async () => {
    try {
      const data = await getBlogPostById(id)
      setPost(data)
    } catch (err: any) {
      setError(err?.message || "Failed to fetch post. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading post...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-md flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Error</p>
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
        <p className="font-medium">Post not found</p>
        <p>The post you're looking for doesn't exist or has been deleted.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return <BlogEditor post={post} />
}

