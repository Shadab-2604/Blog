"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

export default function PreviewPost() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [post, setPost] = useState<any>(null)

  useEffect(() => {
    const postData = searchParams.get("data")
    if (postData) {
      try {
        setPost(JSON.parse(decodeURIComponent(postData)))
      } catch (err) {
        console.error("Failed to parse post data", err)
      }
    }
  }, [searchParams])

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>No preview data available</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor
        </Button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6">
        <p className="text-yellow-700">
          <strong>Preview Mode:</strong> This is how your post will look when published.
        </p>
      </div>

      <article>
        {post.coverImage && (
          <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
            <Image src={post.coverImage || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
          </div>
        )}

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center text-gray-600 mb-8">
          <span>{formatDate(new Date().toISOString())}</span>
          <span className="mx-2">•</span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${post.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
          >
            {post.published ? "Published" : "Draft"}
          </span>
        </div>

        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </div>
  )
}

