"use client"

import React, { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Sparkles, Check } from "lucide-react"

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Shadow",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Pixel",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Nova",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Vortex",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Echo",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Astra",
]

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal, login, register } = useAuth()

  // Sign In form state
  const [loginIdentifier, setLoginIdentifier] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Register form state
  const [regName, setRegName] = useState("")
  const [regUsername, setRegUsername] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0])
  const [isRegistering, setIsRegistering] = useState(false)

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginIdentifier || !loginPassword) return
    setIsLoggingIn(true)
    try {
      await login(loginIdentifier, loginPassword)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName || !regUsername || !regEmail || !regPassword) return
    setIsRegistering(true)
    try {
      await register({
        name: regName,
        username: regUsername.toLowerCase().trim(),
        email: regEmail.toLowerCase().trim(),
        password: regPassword,
        avatar: selectedAvatar,
      })
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-indigo-600/10 text-indigo-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <DialogTitle className="text-xl font-bold">Account Access</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Sign in or create an account to like posts, leave comments, and bookmark articles.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={authModalTab}
          onValueChange={(val) => openAuthModal(val as "login" | "register")}
          className="w-full mt-2"
        >
          <TabsList className="grid w-full grid-cols-2 bg-muted/60">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>

          {/* SIGN IN TAB */}
          <TabsContent value="login" className="space-y-4 pt-4">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-id">Username or Email</Label>
                <Input
                  id="login-id"
                  type="text"
                  placeholder="Enter your username or email"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  className="bg-background/80"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-pass">Password</Label>
                </div>
                <Input
                  id="login-pass"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="bg-background/80"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition-all duration-200"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </TabsContent>

          {/* CREATE ACCOUNT TAB */}
          <TabsContent value="register" className="space-y-4 pt-4">
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="John Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    className="bg-background/80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-user">Username</Label>
                  <Input
                    id="reg-user"
                    type="text"
                    placeholder="johndoe"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                    className="bg-background/80"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email Address</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="john@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="bg-background/80"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-pass">Password</Label>
                <Input
                  id="reg-pass"
                  type="password"
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-background/80"
                />
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2">
                <Label>Choose an Avatar</Label>
                <div className="grid grid-cols-4 gap-2.5 pt-1">
                  {PRESET_AVATARS.map((url, idx) => {
                    const isSelected = selectedAvatar === url
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(url)}
                        className={`relative aspect-square rounded-full p-1 border-2 transition-all duration-200 overflow-hidden bg-muted/40 hover:scale-105 ${
                          isSelected
                            ? "border-indigo-600 ring-2 ring-indigo-500/30 scale-105 bg-indigo-50/10"
                            : "border-border hover:border-indigo-400"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Avatar option ${idx + 1}`}
                          className="w-full h-full object-cover rounded-full"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-indigo-600/30 rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-white drop-shadow-md" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition-all duration-200"
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
