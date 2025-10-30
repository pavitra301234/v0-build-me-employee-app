"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api-client"
import { AlertCircle, CheckCircle } from "lucide-react"

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
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6">
        <h1 className="text-2xl font-bold">Leaves</h1>
        <p className="text-green-100 text-sm mt-1">Manage your leave requests</p>
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-600 text-sm p-3 bg-green-50 rounded">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        <Button onClick={() => setShowForm(!showForm)} className="w-full bg-green-600 hover:bg-green-700">
          {showForm ? "Cancel" : "Apply for Leave"}
        </Button>

        {showForm && (
          <Card className="p-4 bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                <select
                  value={formData.leave_type_id}
                  onChange={(e) => setFormData({ ...formData, leave_type_id: Number.parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={1}>Casual Leave</option>
                  <option value={2}>Sick Leave</option>
                  <option value={3}>Annual Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Enter reason for leave"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                <label htmlFor="half_day" className="text-sm text-gray-700">
                  Half Day
                </label>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Submit Leave Request
              </Button>
            </form>
          </Card>
        )}

        <Card className="p-4 bg-white">
          <h2 className="font-semibold text-gray-900 mb-4">Your Leaves</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : leaves.length > 0 ? (
            <div className="space-y-3">
              {leaves.map((leave) => (
                <div key={leave.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(leave.start_date).toLocaleDateString()} -{" "}
                      {new Date(leave.end_date).toLocaleDateString()}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        leave.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : leave.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{leave.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-sm py-8">No leave records yet</p>
          )}
        </Card>
      </div>

      <Navigation />
    </div>
  )
}
