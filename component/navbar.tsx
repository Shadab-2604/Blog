"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { checkAuth, logout } from "@/lib/api"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const checkAuthentication = async () => {
      const auth = await checkAuth()
      setIsAuthenticated(auth)
    }

    checkAuthentication()
  }, [])

  const handleLogout = async () => {
    await logout()
    setIsAuthenticated(false)
    window.location.href = "/"
  }

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            Blog Platform
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/admin/dashboard" className="text-gray-700 hover:text-gray-900">
                  Dashboard
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/admin/login">
                <Button variant="outline">Admin Login</Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-3 space-y-3">
            <Link href="/" className="block text-gray-700 hover:text-gray-900" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/admin/dashboard"
                  className="block text-gray-700 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="w-full"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/admin/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Admin Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

