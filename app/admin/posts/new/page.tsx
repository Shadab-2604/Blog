export const dynamic = "force-dynamic"

import { NewPostForm } from "@/components/new-post-form"

export default function NewPostPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Create New Article
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Draft and publish technical tutorials, engineering notes, or project stories.
        </p>
      </div>
      <NewPostForm />
    </div>
  )
}
