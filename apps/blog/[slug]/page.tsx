import { getBlogPostBySlug } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"
import Image from "next/image"

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {post.coverImage && (
        <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image src={post.coverImage || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

      <div className="flex items-center text-gray-600 mb-8">
        <span>{formatDate(post.createdAt)}</span>
      </div>

      <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}

