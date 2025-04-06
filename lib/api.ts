import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies/auth
})

// Blog Posts
export async function getBlogPosts() {
  try {
    const response = await api.get("/posts")
    return response.data
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return []
  }
}

export async function getBlogPostById(id: string) {
  try {
    const response = await api.get(`/posts/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching blog post with id ${id}:`, error)
    throw error
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const response = await api.get(`/posts/slug/${slug}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching blog post with slug ${slug}:`, error)
    return null
  }
}

export async function createBlogPost(postData: any) {
  try {
    const response = await api.post("/posts", postData)
    return response.data
  } catch (error) {
    console.error("Error creating blog post:", error)
    throw error
  }
}

export async function updateBlogPost(id: string, postData: any) {
  try {
    const response = await api.put(`/posts/${id}`, postData)
    return response.data
  } catch (error) {
    console.error(`Error updating blog post with id ${id}:`, error)
    throw error
  }
}

export async function deleteBlogPost(id: string) {
  try {
    const response = await api.delete(`/posts/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error deleting blog post with id ${id}:`, error)
    throw error
  }
}

// Image Upload
export async function uploadImage(file: File) {
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

// Authentication
export async function login(username: string, password: string) {
  try {
    const response = await api.post("/auth/login", { username, password })
    return true
  } catch (error) {
    console.error("Login error:", error)
    return false
  }
}

export async function logout() {
  try {
    await api.post("/auth/logout")
    return true
  } catch (error) {
    console.error("Logout error:", error)
    return false
  }
}

export async function checkAuth() {
  try {
    const response = await api.get("/auth/check")
    return response.data.authenticated
  } catch (error) {
    return false
  }
}

