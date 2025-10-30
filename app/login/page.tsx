"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass p-8 space-y-8">
          {/* Logo and Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
              <span className="text-white text-3xl font-bold">ME</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">ME Employee</h1>
              <p className="text-blue-200 text-sm mt-2">HRMS Portal</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-100">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-100">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="glass-input"
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-lg backdrop-blur-md">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="glass-button w-full py-2 text-base">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-blue-200">Demo credentials available from your HR</p>
        </div>
      </div>
    </div>
  )
}
