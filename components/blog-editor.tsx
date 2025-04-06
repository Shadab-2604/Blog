"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Loader2, Save, Eye, Upload, X } from "lucide-react"
import { createBlogPost, updateBlogPost, uploadImage } from "@/lib/api"
import type { BlogPost } from "@/types"
import Image from "next/image"

const TiptapEditor = dynamic(() => import("./tiptap-editor"), { ssr: false });

interface BlogEditorProps {
  post?: BlogPost
}

export function BlogEditor({ post }: BlogEditorProps) {
  const [title, setTitle] = useState(post?.title || "")
  const [content, setContent] = useState(post?.content || "")
  const [slug, setSlug] = useState(post?.slug || "")
  const [published, setPublished] = useState(post?.published || false)
  const [coverImage, setCoverImage] = useState(post?.coverImage || "")
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!post && title && !slug) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-"),
      )
    }
  }, [title, slug, post])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError("")

    try {
      const imageUrl = await uploadImage(file)
      setCoverImage(imageUrl)
    } catch (err) {
      setError("Failed to upload image. Please try again.")
      console.error("Image upload error:", err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveCoverImage = () => {
    setCoverImage("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSave = async (isPublished = published) => {
    if (!title || !content) {
      setError("Title and content are required")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const postData = {
        title,
        content,
        slug,
        published: isPublished,
        coverImage,
      }

      if (post) {
        await updateBlogPost(post._id, postData)
      } else {
        await createBlogPost(postData)
      }

      router.push("/admin/dashboard")
    } catch (err: any) {
      console.error("Save post error:", err)
      setError(err?.response?.data?.message || "Failed to save post. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    const postData = {
      title,
      content,
      slug,
      published,
      coverImage,
    }

    const encodedData = encodeURIComponent(JSON.stringify(postData))
    router.push(`/admin/posts/preview?data=${encodedData}`)
  }

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title"
          className="text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="post-url-slug" />
      </div>

      <div className="space-y-2">
        <Label>Cover Image</Label>
        {coverImage ? (
          <div className="relative">
            <div className="relative w-full h-48 rounded-md overflow-hidden">
              <Image src={coverImage || "/placeholder.svg"} alt="Cover" fill className="object-cover" />
            </div>
            <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={handleRemoveCoverImage}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" ref={fileInputRef} />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Cover Image
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Card className="p-2">
          <TiptapEditor content={content} onChange={setContent} />
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="published" checked={published} onCheckedChange={setPublished} />
        <Label htmlFor="published">Publish post</Label>
      </div>

      <div className="flex space-x-4">
        <Button onClick={() => handleSave()} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save {published ? "as Published" : "as Draft"}
            </>
          )}
        </Button>
        <Button variant="outline" onClick={handlePreview}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
      </div>
    </div>
  )
}
