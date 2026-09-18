export interface User {
  _id: string
  name: string
  email: string
  username: string
  avatar?: string
  role: "admin" | "user"
  savedPosts?: string[]
  createdAt?: string
}

export interface BlogPost {
  _id: string
  title: string
  content: string
  slug: string
  excerpt?: string
  coverImage?: string
  published: boolean
  author?: User | string
  likes?: string[]
  views?: number
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  post: string
  user: User
  content: string
  createdAt: string
  updatedAt: string
}

export interface Notification {
  _id: string
  recipient: string
  sender?: User
  type: "like" | "comment" | "role_change" | "system"
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

export interface PostAnalytics {
  views: number
  likesCount: number
  commentsCount: number
  savesCount: number
}
