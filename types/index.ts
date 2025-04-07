export interface BlogPost {
  _id: string
  title: string
  content: string
  slug: string
  excerpt?: string
  coverImage?: string
  published: boolean
  createdAt: string
  updatedAt: string
}

