"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { useTheme } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api-client"
import { AlertCircle, CheckCircle, Moon, Sun } from "lucide-react"

interface Leave {
  id: string
  leave_type_id: number
  start_date: string
  end_date: string
  status: string
  reason: string
}

export default function LeavesPage() {
  const { user, isLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    leave_type_id: 1,
    start_date: "",
    end_date: "",
    reason: "",
    half_day: false,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const data = await apiClient.getMyLeaves()
        setLeaves(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load leaves")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchLeaves()
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      await apiClient.applyLeave(formData)
      setSuccess("Leave applied successfully!")
      setFormData({
        leave_type_id: 1,
        start_date: "",
        end_date: "",
        reason: "",
        half_day: false,
      })
      setShowForm(false)
      setTimeout(() => setSuccess(""), 3000)

      const data = await apiClient.getMyLeaves()
      setLeaves(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply leave")
    }
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
          <h1 className="text-2xl font-bold text-foreground">Leaves</h1>
          <p className="text-foreground/60 text-sm mt-1">Manage your leave requests</p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg glass hover:bg-white/20 dark:hover:bg-white/10 transition-all"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm p-3 bg-red-500/20 rounded">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm p-3 bg-green-500/20 rounded">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        <Button onClick={() => setShowForm(!showForm)} className="glass-button w-full">
          {showForm ? "Cancel" : "Apply for Leave"}
        </Button>

        {showForm && (
          <div className="glass-card p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Leave Type</label>
                <select
                  value={formData.leave_type_id}
                  onChange={(e) => setFormData({ ...formData, leave_type_id: Number.parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-white/40 dark:border-white/20 rounded-md bg-white/20 dark:bg-white/5 text-foreground"
                >
                  <option value={1}>Casual Leave</option>
                  <option value={2}>Sick Leave</option>
                  <option value={3}>Annual Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Enter reason for leave"
                  className="w-full px-3 py-2 border border-white/40 dark:border-white/20 rounded-md bg-white/20 dark:bg-white/5 text-foreground placeholder-foreground/50"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="half_day"
                  checked={formData.half_day}
                  onChange={(e) => setFormData({ ...formData, half_day: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="half_day" className="text-sm text-foreground">
                  Half Day
                </label>
              </div>

              <Button type="submit" className="glass-button w-full">
                Submit Leave Request
              </Button>
            </form>
          </div>
        )}

        <div className="glass-card p-4">
          <h2 className="font-semibold text-foreground mb-4">Your Leaves</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto"></div>
            </div>
          ) : leaves.length > 0 ? (
            <div className="space-y-3">
              {leaves.map((leave) => (
                <div key={leave.id} className="p-3 bg-white/20 dark:bg-white/5 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-foreground">
                      {new Date(leave.start_date).toLocaleDateString()} -{" "}
                      {new Date(leave.end_date).toLocaleDateString()}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        leave.status === "approved"
                          ? "bg-green-500/30 text-green-700 dark:text-green-400"
                          : leave.status === "rejected"
                            ? "bg-red-500/30 text-red-700 dark:text-red-400"
                            : "bg-yellow-500/30 text-yellow-700 dark:text-yellow-400"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/60">{leave.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-foreground/60 text-sm py-8">No leave records yet</p>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  )
}
