"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import LinkExtension from "@tiptap/extension-link"
import ImageExtension from "@tiptap/extension-image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import {
  Loader2,
  Save,
  Eye,
  Upload,
  X,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  RotateCcw,
  RotateCw,
  Link2,
  Unlink,
  ImagePlus,
  ArrowLeft,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"
import { createBlogPost, updateBlogPost, uploadImage } from "@/lib/api"
import type { BlogPost } from "@/types"
import { toast } from "sonner"

interface BlogEditorProps {
  post?: BlogPost
}

export function BlogEditor({ post }: BlogEditorProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Isolated session key for editing existing post vs drafting a new post
  const sessionKey = post ? `blog-draft-edit-${post._id}` : "blog-draft-new"

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [published, setPublished] = useState(false)
  const [coverImage, setCoverImage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const [hasDraftRestored, setHasDraftRestored] = useState(false)
  const [isManualSlug, setIsManualSlug] = useState(false)

  // TipTap Editor initialization with immediatelyRender: false to avoid SSR hydration bugs
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-600 dark:text-indigo-400 underline font-medium cursor-pointer",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full my-4 shadow-sm",
        },
      }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none min-h-[350px] p-5 focus:outline-none text-foreground leading-relaxed",
        "data-placeholder": "Write your insightful story or article here...",
      },
    },
    onUpdate: ({ editor }) => {
      // Debounce autosave to avoid synchronous storage writes during keystrokes
      debouncedSaveSession("content", editor.getHTML())
    },
  })

  // Debounced session storage updater
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const debouncedSaveSession = useCallback(
    (key: string, value: any) => {
      if (typeof window === "undefined") return
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        try {
          const current = JSON.parse(sessionStorage.getItem(sessionKey) || "{}")
          sessionStorage.setItem(sessionKey, JSON.stringify({ ...current, [key]: value }))
        } catch (e) {
          console.warn("Autosave draft error:", e)
        }
      }, 400)
    },
    [sessionKey]
  )

  // Load initial content on client mount
  useEffect(() => {
    setIsMounted(true)
    if (typeof window === "undefined") return

    try {
      const savedRaw = sessionStorage.getItem(sessionKey)
      const sessionData = savedRaw ? JSON.parse(savedRaw) : null

      if (post) {
        // Editing existing post: prefer post data unless newer draft exists
        setTitle(sessionData?.title || post.title || "")
        setSlug(sessionData?.slug || post.slug || "")
        setPublished(typeof sessionData?.published === "boolean" ? sessionData.published : post.published)
        setCoverImage(sessionData?.coverImage || post.coverImage || "")
        if (sessionData && editor && !editor.isDestroyed) {
          editor.commands.setContent(sessionData.content || post.content || "")
          setHasDraftRestored(true)
        } else if (editor && !editor.isDestroyed) {
          editor.commands.setContent(post.content || "")
        }
      } else {
        // Creating new post: check session draft
        if (sessionData) {
          setTitle(sessionData.title || "")
          setSlug(sessionData.slug || "")
          setPublished(sessionData.published || false)
          setCoverImage(sessionData.coverImage || "")
          if (editor && !editor.isDestroyed && sessionData.content) {
            editor.commands.setContent(sessionData.content)
            setHasDraftRestored(true)
          }
        }
      }
    } catch (e) {
      console.warn("Failed to restore draft:", e)
    }
  }, [editor, post, sessionKey])

  // Handle title change and auto-slug generation smoothly without interfering with keystrokes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    debouncedSaveSession("title", newTitle)

    // Auto-generate slug if user hasn't explicitly customized it
    if (!isManualSlug) {
      const generatedSlug = newTitle
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
      setSlug(generatedSlug)
      debouncedSaveSession("slug", generatedSlug)
    }
  }

  const handleSlugChange = (newSlug: string) => {
    setIsManualSlug(true)
    const formatted = newSlug
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
    setSlug(formatted)
    debouncedSaveSession("slug", formatted)
  }

  const handleResetSlug = () => {
    setIsManualSlug(false)
    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
    setSlug(generatedSlug)
    debouncedSaveSession("slug", generatedSlug)
    toast.success("Slug refreshed from title")
  }

  const handleClearDraft = () => {
    if (confirm("Are you sure you want to discard unsaved draft changes?")) {
      sessionStorage.removeItem(sessionKey)
      setHasDraftRestored(false)
      if (post) {
        setTitle(post.title || "")
        setSlug(post.slug || "")
        setPublished(post.published || false)
        setCoverImage(post.coverImage || "")
        editor?.commands.setContent(post.content || "")
      } else {
        setTitle("")
        setSlug("")
        setPublished(false)
        setCoverImage("")
        editor?.commands.setContent("")
      }
      toast.info("Draft reset")
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      const imageUrl = await uploadImage(file)
      setCoverImage(imageUrl)
      debouncedSaveSession("coverImage", imageUrl)
      toast.success("Cover image uploaded successfully")
    } catch (err) {
      console.error(err)
      setError("Failed to upload image. Please try again.")
      toast.error("Image upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveCoverImage = () => {
    setCoverImage("")
    debouncedSaveSession("coverImage", "")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSave = async (isPublished = published) => {
    const contentHtml = editor?.getHTML() || ""
    const plainText = editor?.getText().trim() || ""

    if (!title.trim()) {
      setError("Please provide a post title")
      toast.error("Title is required")
      return
    }

    if (!plainText && !contentHtml.includes("<img")) {
      setError("Please write some content for your post")
      toast.error("Content is required")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const postData = {
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
        published: isPublished,
        content: contentHtml,
        coverImage,
      }

      if (post) {
        await updateBlogPost(post._id, postData)
        toast.success("Blog post updated successfully!")
      } else {
        await createBlogPost(postData)
        toast.success("Blog post created successfully!")
      }

      sessionStorage.removeItem(sessionKey)
      router.push("/admin/dashboard")
    } catch (err: any) {
      console.error(err)
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to save post."
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    const postData = {
      title,
      content: editor?.getHTML() || "",
      slug,
      published,
      coverImage,
    }

    debouncedSaveSession("title", title)
    debouncedSaveSession("slug", slug)
    debouncedSaveSession("published", published)
    debouncedSaveSession("content", editor?.getHTML() || "")

    const encodedData = encodeURIComponent(JSON.stringify(postData))
    router.push(`/admin/posts/preview?data=${encodedData}`)
  }

  const setLink = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("Enter URL:", previousUrl || "https://")

    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const insertImage = () => {
    if (!editor) return
    const url = window.prompt("Enter image URL:")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/dashboard")}
          className="text-muted-foreground hover:text-foreground gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Button>

        <div className="flex items-center gap-3 flex-wrap">
          {hasDraftRestored && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearDraft}
              className="text-xs text-muted-foreground hover:text-destructive gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Discard Draft
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="border-border hover:border-indigo-500 hover:text-indigo-600 gap-1.5"
          >
            <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Preview
          </Button>

          <Button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {published ? "Publish Post" : "Save as Draft"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Draft Restored Banner */}
      {hasDraftRestored && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Restored unsaved draft from this browser session.</span>
          </div>
          <button
            onClick={handleClearDraft}
            className="underline hover:no-underline font-semibold cursor-pointer"
          >
            Clear Draft
          </button>
        </div>
      )}

      {/* Post Metadata Card */}
      <Card className="p-6 bg-card border-border space-y-6 shadow-xs">
        {/* Title Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="title" className="text-sm font-semibold text-foreground">
              Post Title <span className="text-destructive">*</span>
            </Label>
            <span className="text-xs text-muted-foreground">{title.length} characters</span>
          </div>
          <Input
            id="title"
            placeholder="e.g., Building Resilient Microservices with Next.js and Node"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-lg font-medium bg-background border-input focus-visible:ring-indigo-500"
            autoComplete="off"
          />
        </div>

        {/* Slug Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="slug" className="text-sm font-semibold text-foreground">
              URL Slug
            </Label>
            <button
              type="button"
              onClick={handleResetSlug}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Auto-generate from title
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">/blog/</span>
            <Input
              id="slug"
              placeholder="post-url-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="font-mono text-sm bg-background border-input focus-visible:ring-indigo-500"
            />
          </div>
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Featured Cover Image</Label>

          {coverImage ? (
            <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/20">
              <div className="relative w-full h-56 sm:h-72">
                <Image
                  src={coverImage}
                  alt="Post Cover Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveCoverImage}
                  className="shadow-md gap-1"
                >
                  <X className="w-4 h-4" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border hover:border-indigo-500/50 rounded-xl p-8 text-center transition-colors bg-muted/10">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Upload high quality cover image
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, WebP up to 5MB (16:9 ratio recommended)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="border-border hover:border-indigo-500 hover:text-indigo-600"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-indigo-600" />
                      Uploading to Cloudinary...
                    </>
                  ) : (
                    "Select Image"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Rich Text Editor Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="content-editor" className="text-sm font-semibold text-foreground">
            Post Content <span className="text-destructive">*</span>
          </Label>
          <span className="text-xs text-muted-foreground">Markdown & HTML supported</span>
        </div>

        <Card className="border-border bg-card overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-indigo-500/40 transition-all">
          {/* Rich Text Toolbar */}
          {editor && (
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/40 text-muted-foreground">
              {/* Undo / Redo */}
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-1.5 rounded hover:bg-muted disabled:opacity-40 hover:text-foreground transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-1.5 rounded hover:bg-muted disabled:opacity-40 hover:text-foreground transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-border mx-1" />

              {/* Headings */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-1.5 rounded font-bold text-xs transition-colors ${
                  editor.isActive("heading", { level: 1 })
                    ? "bg-indigo-500/15 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-muted hover:text-foreground"
                }`}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1.5 rounded font-bold text-xs transition-colors ${
                  editor.isActive("heading", { level: 2 })
                    ? "bg-indigo-500/15 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-muted hover:text-foreground"
                }`}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-1.5 rounded font-bold text-xs transition-colors ${
                  editor.isActive("heading", { level: 3 })
                    ? "bg-indigo-500/15 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-muted hover:text-foreground"
                }`}
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-border mx-1" />

              {/* Basic Formatting */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive("bold")
                    ? "bg-indigo-500/15 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "hover:bg-muted hover:text-foreground"
                }`}
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive("italic")
                    ? "bg-indigo-500/15 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "hover:bg-muted hover:text-foreground"
                }`}
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive("strike")
                    ? "bg-indigo-500/15 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "hover:bg-muted hover:text-foreground"
                }`}
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive("code")
                    ? "bg-indigo-500/15 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "hover:bg-muted hover:text-foreground"
                }`}
                title="Inline Code"
              >
                <Code className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-border mx-1" />

              {/* Lists */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive("bulletList")
                    ? "bg-indigo-500/15 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-muted hover:text-foreground"
                }`}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive("orderedList")
                    ? "bg-indigo-500/15 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-muted hover:text-foreground"
                }`}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-border mx-1" />

              {/* Blocks */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive("blockquote")
                    ? "bg-indigo-500/15 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-muted hover:text-foreground"
                }`}
                title="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
                title="Divider Line"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-border mx-1" />

              {/* Links & Images */}
              <button
                type="button"
                onClick={setLink}
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive("link")
                    ? "bg-indigo-500/15 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-muted hover:text-foreground"
                }`}
                title="Insert Link"
              >
                <Link2 className="w-4 h-4" />
              </button>
              {editor.isActive("link") && (
                <button
                  type="button"
                  onClick={() => editor.chain().focus().unsetLink().run()}
                  className="p-1.5 rounded hover:bg-muted text-destructive transition-colors"
                  title="Remove Link"
                >
                  <Unlink className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={insertImage}
                className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
                title="Insert Image by URL"
              >
                <ImagePlus className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Editor Content Area */}
          <div className="bg-background">
            {editor ? (
              <EditorContent editor={editor} />
            ) : (
              <div className="min-h-[350px] p-8 flex items-center justify-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Initializing editor...
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Publish Options & Final Save Button */}
      <Card className="p-6 bg-card border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <Switch
            id="published-toggle"
            checked={published}
            onCheckedChange={(checked) => {
              setPublished(checked)
              debouncedSaveSession("published", checked)
            }}
          />
          <div>
            <Label htmlFor="published-toggle" className="font-semibold text-foreground cursor-pointer">
              {published ? "Published publicly" : "Draft status (private)"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {published
                ? "This post will be visible to all visitors on the main blog page."
                : "Only accessible inside the admin dashboard."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            className="w-full sm:w-auto border-border hover:border-indigo-500 hover:text-indigo-600"
          >
            <Eye className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
            Preview Post
          </Button>

          <Button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {published ? "Publish Post" : "Save Draft"}
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
