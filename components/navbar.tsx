"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { AuthModal } from "@/components/auth-modal"
import {
  Menu,
  X,
  Sun,
  Moon,
  Laptop,
  ExternalLink,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  LogIn,
  Bookmark,
  User as UserIcon,
  Shield,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const { user, role, openAuthModal, logout, isLoading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await logout()
    if (pathname.startsWith("/admin") || pathname.startsWith("/saved")) {
      window.location.href = "/"
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-card/90 backdrop-blur-md border-b border-border/80 transition-colors">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2 focus:outline-none">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                SHADAB<span className="text-indigo-600 dark:text-indigo-400">.DEV</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                BLOG
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                  : "text-foreground/80 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-muted/50"
              }`}
            >
              Home
            </Link>

            {/* Saved Articles (Logged-in users) */}
            {user && (
              <Link
                href="/saved"
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/saved"
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                    : "text-foreground/80 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-muted/50"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                Saved
              </Link>
            )}

            {/* Portfolio External Link */}
            <a
              href="https://shadab-dev.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-foreground/80 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-muted/50 transition-colors"
            >
              Portfolio
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            {/* Admin Dashboard Quick Link (if role === admin) */}
            {role === "admin" && (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.startsWith("/admin/dashboard")
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                      : "text-foreground/80 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-muted/50"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link href="/admin/posts/new">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm">
                    <PlusCircle className="w-4 h-4" />
                    New Post
                  </Button>
                </Link>
              </>
            )}

            {/* Notifications Dropdown (for logged-in users) */}
            {user && <NotificationsDropdown />}

            {/* User Profile or Sign In */}
            {!isLoading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 rounded-full ring-2 ring-transparent hover:ring-indigo-500/30 transition-all p-0.5 focus:outline-none">
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarImage src={user.avatar} alt={user.name || user.username} />
                          <AvatarFallback className="bg-indigo-600/10 text-indigo-600 text-xs font-bold">
                            {(user.name || user.username).substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold leading-none text-foreground">{user.name}</p>
                            {user.role === "admin" ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <Shield className="h-3 w-3" /> ADMIN
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                                MEMBER
                              </span>
                            )}
                          </div>
                          <p className="text-xs leading-none text-muted-foreground">@{user.username}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/saved" className="cursor-pointer">
                          <Bookmark className="mr-2 h-4 w-4 text-indigo-500" />
                          <span>Saved Articles</span>
                        </Link>
                      </DropdownMenuItem>

                      {user.role === "admin" && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard" className="cursor-pointer">
                            <LayoutDashboard className="mr-2 h-4 w-4 text-indigo-500" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-rose-500 focus:text-rose-500 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAuthModal("login")}
                    className="border-border hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                )}
              </>
            )}

            {/* Theme Switcher */}
            {mounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 rounded-full text-foreground/80 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-muted focus-visible:ring-1 focus-visible:ring-indigo-600"
                    aria-label="Toggle theme"
                  >
                    {theme === "dark" ? (
                      <Moon className="w-4 h-4 text-indigo-400" />
                    ) : theme === "light" ? (
                      <Sun className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Laptop className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36 bg-card text-foreground border-border shadow-md">
                  <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2 cursor-pointer">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2 cursor-pointer">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2 cursor-pointer">
                    <Laptop className="w-4 h-4 text-muted-foreground" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Mobile Navigation Toggle & Quick Actions */}
          <div className="flex md:hidden items-center space-x-2">
            {user && <NotificationsDropdown />}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 rounded-full"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
              </Button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-foreground hover:bg-muted focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-md px-4 py-4 space-y-3 shadow-lg">
          {user && (
            <div className="flex items-center gap-3 p-2 bg-muted/40 rounded-xl border border-border">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={user.avatar} alt={user.name || user.username} />
                <AvatarFallback className="bg-indigo-600/10 text-indigo-600 text-sm font-bold">
                  {(user.name || user.username).substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                  {user.role === "admin" && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              </div>
            </div>
          )}

          <Link
            href="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              pathname === "/"
                ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20"
                : "text-foreground hover:bg-muted"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>

          {user && (
            <Link
              href="/saved"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === "/saved"
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20"
                  : "text-foreground hover:bg-muted"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Saved Articles
            </Link>
          )}

          <a
            href="https://shadab-dev.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
            onClick={() => setIsMenuOpen(false)}
          >
            <span>Portfolio</span>
            <ExternalLink className="w-4 h-4 opacity-70" />
          </a>

          {role === "admin" && (
            <>
              <Link
                href="/admin/dashboard"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname.startsWith("/admin/dashboard")
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20"
                    : "text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
              <Link
                href="/admin/posts/new"
                className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 dark:text-indigo-400 hover:bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                + Create New Post
              </Link>
            </>
          )}

          {user ? (
            <Button
              variant="outline"
              onClick={() => {
                handleSignOut()
                setIsMenuOpen(false)
              }}
              className="w-full mt-2 border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <Button
              onClick={() => {
                setIsMenuOpen(false)
                openAuthModal("login")
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      )}

      {/* Global Auth Modal */}
      <AuthModal />
    </header>
  )
}
