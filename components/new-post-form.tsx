"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BlogEditor } from "@/components/blog-editor"
import { checkAuth } from "@/lib/api"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NewPostForm() {
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
          setLoading(false)
        }
      } catch (err: any) {
        setError(err?.message || "Authentication check failed. Please try logging in again.")
        setLoading(false)
      }
    }

    checkAuthentication()
  }, [router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading editor...</p>
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
          <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/login")}>
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  return <BlogEditor />
}

