"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import ImageExtension from "@tiptap/extension-image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Loader2, Save, Eye, Upload, X } from "lucide-react"
import Image from "next/image"
import { createBlogPost, updateBlogPost, uploadImage } from "@/lib/api"
import type { BlogPost } from "@/types"

interface BlogEditorProps {
  post?: BlogPost
}

export function BlogEditor({ post }: BlogEditorProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // SessionStorage keys
  const sessionKey = "blog-editor"

  // Load session values
  const sessionData = typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem(sessionKey) || "{}") : {}

  const [title, setTitle] = useState(post?.title || sessionData.title || "")
  const [slug, setSlug] = useState(post?.slug || sessionData.slug || "")
  const [published, setPublished] = useState(post?.published || sessionData.published || false)
  const [coverImage, setCoverImage] = useState(post?.coverImage || sessionData.coverImage || "")
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const editor = useEditor({
    extensions: [StarterKit, Link, ImageExtension],
    content: post?.content || sessionData.content || "",
    onUpdate: ({ editor }) => {
      updateSession("content", editor.getHTML())
    },
  })

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

  const updateSession = (key: string, value: any) => {
    const current = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")
    sessionStorage.setItem(sessionKey, JSON.stringify({ ...current, [key]: value }))
  }

  const clearSession = () => {
    sessionStorage.removeItem(sessionKey)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError("")

    try {
      const imageUrl = await uploadImage(file)
      setCoverImage(imageUrl)
      updateSession("coverImage", imageUrl)
    } catch (err) {
      setError("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveCoverImage = () => {
    setCoverImage("")
    updateSession("coverImage", "")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSave = async (isPublished = published) => {
    if (!title || !editor?.getHTML()) {
      setError("Title and content are required")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const postData = {
        title,
        slug,
        published: isPublished,
        content: editor.getHTML(),
        coverImage,
      }

      if (post) {
        await updateBlogPost(post._id, postData)
      } else {
        await createBlogPost(postData)
      }

      clearSession()
      router.push("/admin/dashboard")
    } catch (err) {
      setError("Failed to save post. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    const postData = {
      title,
      content: editor?.getHTML(),
      slug,
      published,
      coverImage,
    }

    updateSession("title", title)
    updateSession("slug", slug)
    updateSession("published", published)

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
          onChange={(e) => {
            setTitle(e.target.value)
            updateSession("title", e.target.value)
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
            updateSession("slug", e.target.value)
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Cover Image</Label>
        {coverImage ? (
          <div className="relative">
            <div className="relative w-full h-48 rounded-md overflow-hidden">
              <Image src={coverImage} alt="Cover" fill className="object-cover" />
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveCoverImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              ref={fileInputRef}
            />
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
        <Card className="p-4">
          {editor && (
            <EditorContent
              editor={editor}
              className="prose min-h-[300px]"
            />
          )}
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="published"
          checked={published}
          onCheckedChange={(val) => {
            setPublished(val)
            updateSession("published", val)
          }}
        />
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
