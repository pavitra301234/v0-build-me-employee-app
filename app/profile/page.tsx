"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Mail, Shield } from "lucide-react"

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth()
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-purple-100 text-sm mt-1">Your account information</p>
      </div>

      <div className="p-4 space-y-4">
        <Card className="p-6 bg-white text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-purple-600" size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{user.email}</h2>
          <p className="text-gray-600 text-sm mb-4">Role: {user.role}</p>
        </Card>

        <Card className="p-4 bg-white">
          <h3 className="font-semibold text-gray-900 mb-4">Account Details</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <Mail className="text-gray-600" size={20} />
              <div>
                <p className="text-xs text-gray-600">Email Address</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <Shield className="text-gray-600" size={20} />
              <div>
                <p className="text-xs text-gray-600">Role</p>
                <p className="text-sm font-medium text-gray-900">{user.role}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white">
          <h3 className="font-semibold text-gray-900 mb-4">App Information</h3>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>App Name</span>
              <span className="font-medium text-gray-900">ME Employee</span>
            </div>
            <div className="flex justify-between">
              <span>Version</span>
              <span className="font-medium text-gray-900">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Type</span>
              <span className="font-medium text-gray-900">PWA</span>
            </div>
          </div>
        </Card>

        <Button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700">
          Logout
        </Button>
      </div>

      <Navigation />
    </div>
  )
}
