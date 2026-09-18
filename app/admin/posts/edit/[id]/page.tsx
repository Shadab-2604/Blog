export const dynamic = "force-dynamic"

import { EditPostForm } from "@/components/edit-post-form"

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Edit Article
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Make revisions and updates to your published or drafted post.
        </p>
      </div>
      <EditPostForm id={id} />
    </div>
  )
}
