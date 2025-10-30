"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { useTheme } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { User, Mail, Shield, Moon, Sun } from "lucide-react"

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-foreground/60">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen gradient-bg pb-24">
      <div className="glass-dark m-4 mt-6 p-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-foreground/60 text-sm mt-1">Your account information</p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg glass hover:bg-white/20 dark:hover:bg-white/10 transition-all"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="glass-card p-6 text-center">
          <div className="w-20 h-20 bg-sky-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-sky-600 dark:text-sky-400" size={40} />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{user.email}</h2>
          <p className="text-foreground/60 text-sm mb-4">Role: {user.role}</p>
        </div>

        <div className="glass-card p-4">
          <h3 className="font-semibold text-foreground mb-4">Account Details</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/20 dark:bg-white/5 rounded">
              <Mail className="text-foreground/60" size={20} />
              <div>
                <p className="text-xs text-foreground/60">Email Address</p>
                <p className="text-sm font-medium text-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/20 dark:bg-white/5 rounded">
              <Shield className="text-foreground/60" size={20} />
              <div>
                <p className="text-xs text-foreground/60">Role</p>
                <p className="text-sm font-medium text-foreground">{user.role}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="font-semibold text-foreground mb-4">App Information</h3>

          <div className="space-y-3 text-sm text-foreground/60">
            <div className="flex justify-between">
              <span>App Name</span>
              <span className="font-medium text-foreground">ME Employee</span>
            </div>
            <div className="flex justify-between">
              <span>Version</span>
              <span className="font-medium text-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Type</span>
              <span className="font-medium text-foreground">PWA</span>
            </div>
          </div>
        </div>

        <Button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700">
          Logout
        </Button>
      </div>

      <Navigation />
    </div>
  )
}
