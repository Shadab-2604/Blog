import { getBlogPosts } from "@/lib/api"
import { BlogCard } from "@/components/blog-card"

export default async function Home() {
  const posts = await getBlogPosts()

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>

      {posts.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-xl text-gray-600">No blog posts found</h2>
          <p className="mt-2 text-gray-500">Check back later for new content</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </main>
  )
}

