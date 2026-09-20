export const dynamic = "force-dynamic"

import { getBlogPostBySlug, getBlogPostById } from "@/lib/api"
import { BlogPostView } from "@/components/blog-post-view"

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  let post = await getBlogPostBySlug(decodedSlug)
  if (!post) {
    try {
      post = await getBlogPostById(decodedSlug)
    } catch {
      post = null
    }
  }

  return <BlogPostView initialPost={post} slug={decodedSlug} />
}
