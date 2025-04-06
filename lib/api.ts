import axios, { type AxiosError } from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies/auth
})

// Error handler
const handleApiError = (error: any, defaultMessage: string) => {
  console.error(defaultMessage, error)

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error("Response data:", error.response.data)
    console.error("Response status:", error.response.status)

    // If it's a 401 Unauthorized error, redirect to login
    if (error.response.status === 401 && typeof window !== "undefined") {
      window.location.href = "/admin/login"
    }

    throw error
  } else if (error.request) {
    // The request was made but no response was received
    console.error("No response received:", error.request)
    throw new Error("No response from server. Please check your connection.")
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error("Request error:", error.message)
    throw new Error(defaultMessage)
  }
}

// Blog Posts
export async function getBlogPosts() {
  try {
    const response = await api.get("/posts")
    return response.data
  } catch (error) {
    handleApiError(error, "Error fetching blog posts")
    return []
  }
}

export async function getBlogPostById(id: string) {
  try {
    const response = await api.get(`/posts/${id}`)
    return response.data
  } catch (error) {
    handleApiError(error, `Error fetching blog post with id ${id}`)
    throw error
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const response = await api.get(`/posts/slug/${slug}`)
    return response.data
  } catch (error) {
    // For 404 errors, we want to return null instead of throwing
    if ((error as AxiosError).response?.status === 404) {
      return null
    }
    handleApiError(error, `Error fetching blog post with slug ${slug}`)
    return null
  }
}

export async function createBlogPost(postData: any) {
  try {
    const response = await api.post("/posts", postData)
    return response.data
  } catch (error) {
    handleApiError(error, "Error creating blog post")
    throw error
  }
}

export async function updateBlogPost(id: string, postData: any) {
  try {
    const response = await api.put(`/posts/${id}`, postData)
    return response.data
  } catch (error) {
    handleApiError(error, `Error updating blog post with id ${id}`)
    throw error
  }
}

export async function deleteBlogPost(id: string) {
  try {
    const response = await api.delete(`/posts/${id}`)
    return response.data
  } catch (error) {
    handleApiError(error, `Error deleting blog post with id ${id}`)
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
    handleApiError(error, "Error uploading image")
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
    console.error("Auth check error:", error)
    return false
  }
}

