import axios from "axios"
import type { BlogPost, Comment, Notification, PostAnalytics, User } from "@/types"

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("192.168.")
    if (isLocalhost) {
      return "http://localhost:5000/api"
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
}

// Create axios instance
export const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true, // Important for cookies/auth
  timeout: 10000,
})

// Ensure in-browser requests always hit the active environment URL & attach auth header if present
api.interceptors.request.use((config) => {
  config.baseURL = getBaseUrl()
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// ==================== BLOG POSTS ====================
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await api.get("/posts")
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    return []
  }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    const response = await api.get(`/posts/${id}`)
    return response.data
  } catch (error) {
    return null
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await api.get(`/posts/slug/${slug}`)
    return response.data
  } catch (error) {
    return null
  }
}

export async function createBlogPost(postData: Partial<BlogPost>): Promise<BlogPost> {
  try {
    const response = await api.post("/posts", postData)
    return response.data
  } catch (error) {
    console.error("Error creating blog post:", error)
    throw error
  }
}

export async function updateBlogPost(id: string, postData: Partial<BlogPost>): Promise<BlogPost> {
  try {
    const response = await api.put(`/posts/${id}`, postData)
    return response.data
  } catch (error) {
    console.error(`Error updating blog post with id ${id}:`, error)
    throw error
  }
}

export async function deleteBlogPost(id: string): Promise<{ message: string }> {
  try {
    const response = await api.delete(`/posts/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error deleting blog post with id ${id}:`, error)
    throw error
  }
}

// ==================== INTERACTIONS & ANALYTICS ====================
export async function toggleLike(postId: string): Promise<{ liked: boolean; likesCount: number; likes: string[] }> {
  const response = await api.post(`/posts/${postId}/like`)
  return response.data
}

export async function toggleSavePost(postId: string): Promise<{ saved: boolean; savedPosts: string[] }> {
  const response = await api.post(`/posts/${postId}/save`)
  return response.data
}

export async function getSavedPosts(): Promise<BlogPost[]> {
  try {
    const response = await api.get("/posts/saved")
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    return []
  }
}

export async function incrementView(postId: string): Promise<{ views: number }> {
  try {
    const response = await api.post(`/posts/${postId}/view`)
    return response.data
  } catch (error) {
    return { views: 0 }
  }
}

export async function getPostAnalytics(postId: string): Promise<PostAnalytics> {
  const response = await api.get(`/posts/${postId}/analytics`)
  return response.data
}

// ==================== COMMENTS ====================
export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  try {
    const response = await api.get(`/comments/post/${postId}`)
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    return []
  }
}

export async function createComment(postId: string, content: string): Promise<Comment> {
  // Post to /comments/post/:postId with fallback body
  const response = await api.post(`/comments/post/${postId}`, { postId, content })
  return response.data
}

export async function deleteComment(commentId: string): Promise<{ message: string }> {
  const response = await api.delete(`/comments/${commentId}`)
  return response.data
}

// ==================== NOTIFICATIONS ====================
export async function getNotifications(): Promise<Notification[]> {
  try {
    const response = await api.get("/notifications")
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    return []
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    await api.put(`/notifications/${id}/read`)
  } catch (error) {
    // Ignore error
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    await api.put("/notifications/read-all")
  } catch (error) {
    // Ignore error
  }
}

// ==================== IMAGE UPLOAD ====================
export async function uploadImage(file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append("image", file)

    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data.url
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

// ==================== AUTHENTICATION & USERS ====================
export async function register(data: {
  name: string
  email: string
  username: string
  password: string
  avatar?: string
}): Promise<{ user: User; token?: string }> {
  const response = await api.post("/auth/register", data)
  if (typeof window !== "undefined" && response.data?.token) {
    localStorage.setItem("auth_token", response.data.token)
  }
  return response.data
}

export async function login(usernameOrEmail: string, password: string): Promise<{ user: User; token?: string }> {
  const response = await api.post("/auth/login", {
    username: usernameOrEmail,
    password,
  })
  if (typeof window !== "undefined" && response.data?.token) {
    localStorage.setItem("auth_token", response.data.token)
  }
  return response.data
}

export async function logout(): Promise<boolean> {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
    await api.post("/auth/logout")
    return true
  } catch (error) {
    return false
  }
}

export async function getMe(): Promise<User | null> {
  try {
    const response = await api.get("/auth/me")
    return response.data?.user || null
  } catch (error) {
    return null
  }
}

export async function checkAuth(): Promise<boolean> {
  const user = await getMe()
  return !!user
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const response = await api.get("/auth/users")
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    return []
  }
}

export async function updateUserRole(userId: string, role: "user" | "admin"): Promise<User> {
  const response = await api.put(`/auth/users/${userId}/role`, { role })
  return response.data
}
