"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  getBlogPosts,
  deleteBlogPost,
  getAllUsers,
  updateUserRole,
  getPostAnalytics,
} from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { formatDate } from "@/lib/utils"
import {
  Trash2,
  Edit,
  Plus,
  AlertCircle,
  Loader2,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  BookOpen,
  Sparkles,
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  BarChart3,
  Eye,
  Heart,
  MessageSquare,
  Bookmark,
  TrendingUp,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { BlogPost, User, PostAnalytics } from "@/types"
import { toast } from "sonner"

export function AdminDashboard() {
  const { user, role, isLoading: authLoading } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"articles" | "users">("articles")
  const [userActionLoading, setUserActionLoading] = useState<string | null>(null)

  // Analytics Modal State
  const [selectedPostAnalytics, setSelectedPostAnalytics] = useState<{
    post: BlogPost
    analytics: PostAnalytics
  } | null>(null)
  const [loadingAnalyticsId, setLoadingAnalyticsId] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    if (authLoading) return

    if (!user || user.role !== "admin") {
      router.push("/admin/login")
      return
    }

    fetchInitialData()
  }, [user, role, authLoading, router])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [postsData, usersData] = await Promise.all([
        getBlogPosts(),
        getAllUsers(),
      ])
      setPosts(Array.isArray(postsData) ? postsData : [])
      setUsers(Array.isArray(usersData) ? usersData : [])
    } catch (err: any) {
      setError(err?.message || "Failed to fetch dashboard data.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? Only admins can perform this action.`)) {
      try {
        setDeleteLoading(id)
        await deleteBlogPost(id)
        setPosts((prev) => prev.filter((post) => post._id !== id))
        toast.success("Post deleted successfully")
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete post")
      } finally {
        setDeleteLoading(null)
      }
    }
  }

  const handleToggleUserRole = async (targetUser: User) => {
    if (targetUser._id === user?._id) {
      toast.error("You cannot modify your own administrative privileges.")
      return
    }

    const newRole = targetUser.role === "admin" ? "user" : "admin"
    const confirmMsg =
      newRole === "admin"
        ? `Grant full Admin permissions to ${targetUser.name || targetUser.username}?`
        : `Demote ${targetUser.name || targetUser.username} back to standard User role?`

    if (!window.confirm(confirmMsg)) return

    try {
      setUserActionLoading(targetUser._id)
      const updated = await updateUserRole(targetUser._id, newRole)
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, role: updated.role } : u))
      )
      toast.success(
        `${targetUser.name || targetUser.username} is now ${newRole === "admin" ? "an Admin" : "a standard User"}`
      )
    } catch (err: any) {
      toast.error(err?.message || "Failed to update role")
    } finally {
      setUserActionLoading(null)
    }
  }

  const handleOpenAnalytics = async (post: BlogPost) => {
    try {
      setLoadingAnalyticsId(post._id)
      const analytics = await getPostAnalytics(post._id)
      setSelectedPostAnalytics({ post, analytics })
    } catch (err) {
      toast.error("Failed to load post analytics")
    } finally {
      setLoadingAnalyticsId(null)
    }
  }

  const publishedCount = posts.filter((p) => p.published).length
  const draftCount = posts.filter((p) => !p.published).length
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0)
  const totalLikes = posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0)

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = (post.title || "").toLowerCase().includes(searchQuery.toLowerCase().trim())
    if (statusFilter === "published") return matchesSearch && post.published
    if (statusFilter === "draft") return matchesSearch && !post.published
    return matchesSearch
  })

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-muted-foreground font-medium">Verifying admin credentials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 max-w-6xl">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Administrative Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage articles, oversee user permissions, and monitor engagement analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/posts/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm font-semibold">
              <Plus className="h-4 w-4" />
              Create Article
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Articles
            </CardTitle>
            <FileText className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-foreground">{posts.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {publishedCount} published, {draftCount} drafts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Views
            </CardTitle>
            <Eye className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">{totalViews}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Across all published posts</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Likes
            </CardTitle>
            <Heart className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">{totalLikes}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Community reactions</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Registered Users
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {users.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {users.filter((u) => u.role === "admin").length} admins assigned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs: Articles & Users */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "articles" | "users")} className="space-y-6">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="articles" className="gap-2 text-xs sm:text-sm font-semibold">
            <FileText className="w-4 h-4" />
            Articles Management ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2 text-xs sm:text-sm font-semibold">
            <Users className="w-4 h-4" />
            User Roles ({users.length})
          </TabsTrigger>
        </TabsList>

        {/* ARTICLES MANAGEMENT TAB */}
        <TabsContent value="articles" className="space-y-4">
          <Card className="bg-card border-border shadow-xs overflow-hidden">
            {/* Filter Bar */}
            <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-input text-sm"
                />
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    statusFilter === "all"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({posts.length})
                </button>
                <button
                  onClick={() => setStatusFilter("published")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    statusFilter === "published"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Published ({publishedCount})
                </button>
                <button
                  onClick={() => setStatusFilter("draft")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    statusFilter === "draft"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Drafts ({draftCount})
                </button>
              </div>
            </div>

            {/* Table Content */}
            <CardContent className="p-0">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                  <p className="text-base font-semibold text-foreground">No posts found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery ? `No posts matched "${searchQuery}".` : "Get started by creating your first article!"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                        <th className="text-left py-3.5 px-6 font-semibold">Title</th>
                        <th className="text-left py-3.5 px-4 font-semibold">Metrics</th>
                        <th className="text-left py-3.5 px-4 font-semibold">Status</th>
                        <th className="text-left py-3.5 px-4 font-semibold">Date</th>
                        <th className="text-right py-3.5 px-6 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredPosts.map((post) => (
                        <tr key={post._id} className="hover:bg-muted/40 transition-colors group">
                          <td className="py-4 px-6 max-w-xs">
                            <div className="font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                              {post.title}
                            </div>
                            <div className="text-xs font-mono text-muted-foreground mt-0.5 truncate">
                              /blog/{post.slug || post._id}
                            </div>
                          </td>

                          {/* Quick Metrics */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1" title="Views">
                                <Eye className="w-3.5 h-3.5 text-sky-500" />
                                {post.views || 0}
                              </span>
                              <span className="flex items-center gap-1" title="Likes">
                                <Heart className="w-3.5 h-3.5 text-rose-500" />
                                {post.likes?.length || 0}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                post.published
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  post.published ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                              />
                              {post.published ? "Published" : "Draft"}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-muted-foreground whitespace-nowrap text-xs">
                            {formatDate(post.createdAt)}
                          </td>

                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex justify-end items-center gap-1.5">
                              {/* Analytics Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenAnalytics(post)}
                                disabled={loadingAnalyticsId === post._id}
                                className="h-8 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 px-2.5"
                                title="View detailed analytics"
                              >
                                {loadingAnalyticsId === post._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <BarChart3 className="h-3.5 w-3.5" />
                                )}
                                Analytics
                              </Button>

                              <Link href={`/blog/${post.slug || post._id}`} target="_blank" title="View live post">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </Link>

                              <Link href={`/admin/posts/edit/${post._id}`} title="Edit article">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 border-border hover:border-indigo-500 text-foreground"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </Link>

                              {/* Only admin can delete posts */}
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(post._id, post.title)}
                                disabled={deleteLoading === post._id}
                                title="Delete article"
                                className="h-8 w-8 border-border hover:border-destructive text-destructive hover:bg-destructive/10"
                              >
                                {deleteLoading === post._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* USER MANAGEMENT TAB */}
        <TabsContent value="users" className="space-y-4">
          <Card className="bg-card border-border shadow-xs overflow-hidden">
            <CardHeader className="border-b border-border/80">
              <CardTitle className="text-lg font-bold text-foreground">User Management & Roles</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                View all registered community members and assign or revoke administrative rights.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                      <th className="text-left py-3.5 px-6 font-semibold">User Profile</th>
                      <th className="text-left py-3.5 px-6 font-semibold">Email</th>
                      <th className="text-left py-3.5 px-6 font-semibold">Role</th>
                      <th className="text-left py-3.5 px-6 font-semibold">Joined Date</th>
                      <th className="text-right py-3.5 px-6 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((u) => {
                      const isSelf = u._id === user?._id
                      const isAdmin = u.role === "admin"

                      return (
                        <tr key={u._id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-border">
                                <AvatarImage src={u.avatar} alt={u.name || u.username} />
                                <AvatarFallback className="bg-indigo-600/10 text-indigo-600 text-xs font-bold">
                                  {(u.name || u.username).substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-foreground flex items-center gap-1.5">
                                  {u.name || u.username}
                                  {isSelf && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 font-bold">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">@{u.username}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-muted-foreground text-xs">{u.email}</td>

                          <td className="py-4 px-6 whitespace-nowrap">
                            {isAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                <Shield className="w-3.5 h-3.5" />
                                ADMIN
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                                MEMBER
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-muted-foreground text-xs whitespace-nowrap">
                            {u.createdAt ? formatDate(u.createdAt) : "N/A"}
                          </td>

                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            {isSelf ? (
                              <span className="text-xs text-muted-foreground italic">Current Account</span>
                            ) : (
                              <Button
                                size="sm"
                                variant={isAdmin ? "outline" : "default"}
                                onClick={() => handleToggleUserRole(u)}
                                disabled={userActionLoading === u._id}
                                className={
                                  isAdmin
                                    ? "text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                                    : "text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                }
                              >
                                {userActionLoading === u._id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : isAdmin ? (
                                  "Revoke Admin"
                                ) : (
                                  "Assign as Admin"
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DETAILED POST ANALYTICS MODAL */}
      <Dialog
        open={!!selectedPostAnalytics}
        onOpenChange={(open) => !open && setSelectedPostAnalytics(null)}
      >
        <DialogContent className="sm:max-w-lg bg-card border-border text-foreground">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="h-5 w-5" />
              <DialogTitle className="text-xl font-bold">Article Performance Analytics</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-xs">
              Detailed engagement overview for "{selectedPostAnalytics?.post.title}"
            </DialogDescription>
          </DialogHeader>

          {selectedPostAnalytics && (
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-2 gap-4">
                {/* Views */}
                <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-2">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-foreground">
                    {selectedPostAnalytics.analytics.views}
                  </div>
                  <p className="text-xs font-medium text-sky-600 dark:text-sky-400">Total Pageviews</p>
                </div>

                {/* Likes */}
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-2">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-foreground">
                    {selectedPostAnalytics.analytics.likesCount}
                  </div>
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Reader Likes</p>
                </div>

                {/* Comments */}
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-foreground">
                    {selectedPostAnalytics.analytics.commentsCount}
                  </div>
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Comments Posted</p>
                </div>

                {/* Saves */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-foreground">
                    {selectedPostAnalytics.analytics.savesCount}
                  </div>
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">User Bookmarks</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>URL Slug:</span>
                  <span className="font-mono text-foreground font-semibold">
                    /{selectedPostAnalytics.post.slug}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Created Date:</span>
                  <span className="text-foreground font-semibold">
                    {formatDate(selectedPostAnalytics.post.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Publication State:</span>
                  <span
                    className={
                      selectedPostAnalytics.post.published
                        ? "text-emerald-500 font-semibold"
                        : "text-amber-500 font-semibold"
                    }
                  >
                    {selectedPostAnalytics.post.published ? "Live & Public" : "Draft Only"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
