export const dynamic = "force-dynamic"

import { NewPostForm } from "@/components/new-post-form"

export default function NewPostPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      <NewPostForm />
    </div>
  )
}

