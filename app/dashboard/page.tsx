"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { Clock, Calendar, AlertCircle } from "lucide-react"

interface AttendanceRecord {
  id: string
  clock_in_at: string
  clock_out_at: string | null
  total_seconds: number
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [attendanceLoading, setAttendanceLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await apiClient.getLatestAttendance(5)
        setAttendance(data.records || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load attendance")
      } finally {
        setAttendanceLoading(false)
      }
    }

    if (user) {
      fetchAttendance()
    }
  }, [user])

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
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
        <p className="text-blue-100 text-sm mt-1">Role: {user.role}</p>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Clock In</p>
                <Button
                  onClick={() => router.push("/attendance")}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-xs"
                >
                  Go to Attendance
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Leaves</p>
                <Button onClick={() => router.push("/leaves")} className="mt-2 bg-green-600 hover:bg-green-700 text-xs">
                  View Leaves
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 bg-white">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Attendance</h2>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {attendanceLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : attendance.length > 0 ? (
            <div className="space-y-3">
              {attendance.map((record) => (
                <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(record.clock_in_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(record.clock_in_at).toLocaleTimeString()} -{" "}
                      {record.clock_out_at ? new Date(record.clock_out_at).toLocaleTimeString() : "Ongoing"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {Math.floor(record.total_seconds / 3600)}h {Math.floor((record.total_seconds % 3600) / 60)}m
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-sm py-8">No attendance records yet</p>
          )}
        </Card>
      </div>

      <Navigation />
    </div>
  )
}
