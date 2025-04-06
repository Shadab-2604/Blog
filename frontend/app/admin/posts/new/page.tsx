"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BlogEditor } from "@/components/blog-editor"
import { checkAuth } from "@/lib/api"

export default function NewPost() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = await checkAuth()
      if (!isAuthenticated) {
        router.push("/admin/login")
      } else {
        setLoading(false)
      }
    }

    checkAuthentication()
  }, [router])

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      <BlogEditor />
    </div>
  )
}

