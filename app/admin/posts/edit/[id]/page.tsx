export const dynamic = "force-dynamic"

import { EditPostForm } from "@/components/edit-post-form"

export default function EditPostPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
      <EditPostForm id={params.id} />
    </div>
  )
}

