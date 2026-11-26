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
  ArrowUpRight,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  LogIn,
  Bookmark,
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
    <header className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-xl border-b border-border transition-colors">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2.5 focus:outline-none">
              <span className="text-base sm:text-lg font-semibold tracking-tight text-foreground group-hover:opacity-80 transition-opacity">
                SHADAB<span className="text-muted-foreground">.DEV</span>
              </span>
              <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border uppercase tracking-wider">
                BLOG
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "text-foreground bg-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
            >
              Home
            </Link>

            {/* Saved Articles (Logged-in users) */}
            {user && (
              <Link
                href="/saved"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/saved"
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                Saved
              </Link>
            )}

            {/* Portfolio External Link */}
            <a
              href="https://shadab-dev.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            >
              Portfolio
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>

            {/* Admin Dashboard Quick Link (if role === admin) */}
            {role === "admin" && (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith("/admin/dashboard")
                      ? "text-foreground bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <Link href="/admin/posts/new">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-[10px]">
                    <PlusCircle className="w-3.5 h-3.5" />
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
                      <button className="flex items-center gap-2 rounded-full ring-2 ring-transparent hover:ring-foreground/20 transition-all p-0.5 focus:outline-none">
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarImage src={user.avatar} alt={user.name || user.username} />
                          <AvatarFallback className="bg-secondary text-foreground text-xs font-semibold">
                            {(user.name || user.username).substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover border-border shadow-xl">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold leading-none text-foreground">{user.name}</p>
                            {user.role === "admin" ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <Shield className="h-3 w-3" /> ADMIN
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground">
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
                          <Bookmark className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Saved Articles</span>
                        </Link>
                      </DropdownMenuItem>

                      {user.role === "admin" && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard" className="cursor-pointer">
                            <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
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
                    className="border-border hover:border-foreground/30 hover:bg-card gap-1.5 rounded-[10px]"
                  >
                    <LogIn className="w-3.5 h-3.5" />
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
                    className="w-9 h-9 rounded-[10px] border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-card"
                    aria-label="Toggle theme"
                  >
                    {theme === "dark" ? (
                      <Moon className="w-4 h-4" />
                    ) : theme === "light" ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Laptop className="w-4 h-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36 bg-popover text-popover-foreground border-border shadow-md">
                  <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2 cursor-pointer">
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2 cursor-pointer">
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2 cursor-pointer">
                    <Laptop className="w-4 h-4" />
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
                className="w-9 h-9 rounded-[10px] border border-border"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-[10px] border border-border text-foreground hover:bg-card focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-4 py-4 space-y-2 shadow-lg">
          {user && (
            <div className="flex items-center gap-3 p-2.5 bg-card rounded-xl border border-border mb-2">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={user.avatar} alt={user.name || user.username} />
                <AvatarFallback className="bg-secondary text-foreground text-sm font-semibold">
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
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              pathname === "/"
                ? "text-foreground bg-secondary"
                : "text-muted-foreground hover:text-foreground hover:bg-card"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>

          {user && (
            <Link
              href="/saved"
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === "/saved"
                  ? "text-foreground bg-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
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
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card"
            onClick={() => setIsMenuOpen(false)}
          >
            <span>Portfolio</span>
            <ArrowUpRight className="w-4 h-4 opacity-70" />
          </a>

          {role === "admin" && (
            <>
              <Link
                href="/admin/dashboard"
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname.startsWith("/admin/dashboard")
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
              <Link
                href="/admin/posts/new"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-card"
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
              className="w-full mt-2 border-rose-500/30 text-rose-600 hover:bg-rose-500/10 rounded-[10px]"
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
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-[10px]"
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
