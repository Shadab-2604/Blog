"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User, Notification } from "@/types"
import {
  getMe,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  toggleSavePost,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api"
import { getSocket } from "@/lib/socket"
import { toast } from "sonner"

interface AuthContextType {
  user: User | null
  role: "guest" | "user" | "admin"
  isLoading: boolean
  isAuthModalOpen: boolean
  authModalTab: "login" | "register"
  openAuthModal: (tab?: "login" | "register") => void
  closeAuthModal: () => void
  login: (usernameOrEmail: string, pass: string) => Promise<boolean>
  register: (data: {
    name: string
    email: string
    username: string
    password: string
    avatar?: string
  }) => Promise<boolean>
  logout: () => Promise<void>
  savedPostIds: Set<string>
  isSaved: (postId: string) => boolean
  toggleSave: (postId: string) => Promise<boolean>
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login")
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set())
  const [notifications, setNotifications] = useState<Notification[]>([])

  const role: "guest" | "user" | "admin" = user ? user.role : "guest"

  // Fetch current user on mount
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getMe()
      if (currentUser) {
        setUser(currentUser)
        setSavedPostIds(new Set(currentUser.savedPosts || []))
      } else {
        setUser(null)
        setSavedPostIds(new Set())
      }
    } catch (err) {
      setUser(null)
      setSavedPostIds(new Set())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // Fetch notifications whenever user is logged in
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      return
    }
    try {
      const notifs = await getNotifications()
      setNotifications(notifs)
    } catch (err) {
      console.error("Failed to fetch notifications", err)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user, fetchNotifications])

  // Socket listener setup
  useEffect(() => {
    if (!user) return

    const socket = getSocket()
    socket.emit("join_user", user._id)

    const handleNotification = (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev])
      toast.info(notif.title, {
        description: notif.message,
      })
    }

    const handleRoleUpdated = (data: { userId: string; role: "user" | "admin" }) => {
      if (data.userId === user._id) {
        setUser((prev) => (prev ? { ...prev, role: data.role } : null))
        toast.info("Role Updated", {
          description: `Your account role has been updated to ${data.role.toUpperCase()}`,
        })
      }
    }

    socket.on("notification", handleNotification)
    socket.on("role_updated", handleRoleUpdated)

    return () => {
      socket.off("notification", handleNotification)
      socket.off("role_updated", handleRoleUpdated)
    }
  }, [user])

  const openAuthModal = (tab: "login" | "register" = "login") => {
    setAuthModalTab(tab)
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  const login = async (usernameOrEmail: string, pass: string): Promise<boolean> => {
    try {
      const data = await apiLogin(usernameOrEmail, pass)
      if (data && data.user) {
        setUser(data.user)
        setSavedPostIds(new Set(data.user.savedPosts || []))
        closeAuthModal()
        toast.success(`Welcome back, ${data.user.name || data.user.username}!`)
        return true
      }
      return false
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid credentials"
      toast.error(msg)
      return false
    }
  }

  const register = async (data: {
    name: string
    email: string
    username: string
    password: string
    avatar?: string
  }): Promise<boolean> => {
    try {
      const res = await apiRegister(data)
      if (res && res.user) {
        setUser(res.user)
        setSavedPostIds(new Set(res.user.savedPosts || []))
        closeAuthModal()
        toast.success(`Account created! Welcome, ${res.user.name || res.user.username}!`)
        return true
      }
      return false
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registration failed"
      toast.error(msg)
      return false
    }
  }

  const logout = async () => {
    try {
      await apiLogout()
    } finally {
      setUser(null)
      setSavedPostIds(new Set())
      setNotifications([])
      toast.info("Logged out successfully")
    }
  }

  const isSaved = (postId: string) => savedPostIds.has(postId)

  const toggleSave = async (postId: string): Promise<boolean> => {
    if (!user) {
      openAuthModal("login")
      return false
    }
    try {
      const res = await toggleSavePost(postId)
      setSavedPostIds(new Set(res.savedPosts || []))
      if (res.saved) {
        toast.success("Post saved to bookmarks")
      } else {
        toast.info("Post removed from bookmarks")
      }
      return res.saved
    } catch (err) {
      toast.error("Could not update saved posts")
      return false
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      )
    } catch (err) {
      console.error(err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        savedPostIds,
        isSaved,
        toggleSave,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
