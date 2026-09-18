"use client"

import React, { useEffect, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

interface TiptapEditorProps {
  content: string
  onChange: (value: string) => void
  placeholder?: string
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange, placeholder = "Write your blog post content here..." }) => {
  const isUpdatingRef = useRef(false)

  const editor = useEditor({
    extensions: [StarterKit],
    content: content || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-indigo dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-foreground",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      isUpdatingRef.current = true
      onChange(editor.getHTML())
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 0)
    },
  })

  // Only synchronize content if the update came externally (not from user typing inside editor)
  useEffect(() => {
    if (editor && !isUpdatingRef.current && content !== editor.getHTML()) {
      editor.commands.setContent(content || "", false)
    }
  }, [content, editor])

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all">
      <EditorContent editor={editor} />
    </div>
  )
}

export default TiptapEditor
