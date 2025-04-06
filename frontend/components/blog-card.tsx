import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { BlogPost } from "@/types"

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
        {post.coverImage && (
          <div className="relative w-full h-48">
            <Image src={post.coverImage || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
          </div>
        )}
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-2 line-clamp-2">{post.title}</h2>
          <div
            className="text-gray-600 line-clamp-3 text-sm"
            dangerouslySetInnerHTML={{
              __html: post.excerpt || post.content.substring(0, 150) + "...",
            }}
          />
        </CardContent>
        <CardFooter className="text-sm text-gray-500">{formatDate(post.createdAt)}</CardFooter>
      </Card>
    </Link>
  )
}

