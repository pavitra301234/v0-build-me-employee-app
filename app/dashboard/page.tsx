"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { useTheme } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import { apiClient } from "@/lib/api-client"
import { Clock, Calendar, AlertCircle, TrendingUp, Moon, Sun } from "lucide-react"

interface AttendanceRecord {
  id: string
  clock_in_at: string
  clock_out_at: string | null
  total_seconds: number
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()
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
      <div className="glass-dark m-4 mt-6 p-6 space-y-2 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-foreground/70">{user.email}</p>
          <p className="text-sm text-foreground/60">Role: {user.role}</p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg glass hover:bg-white/20 dark:hover:bg-white/10 transition-all"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/attendance")}
            className="glass-card p-6 hover:bg-white/40 dark:hover:bg-white/10 transition-all group"
          >
            <div className="bg-sky-500/30 p-3 rounded-lg w-fit mb-3 group-hover:bg-sky-500/50 transition-all">
              <Clock className="text-sky-600 dark:text-sky-400" size={24} />
            </div>
            <p className="text-foreground font-medium text-sm">Clock In/Out</p>
            <p className="text-xs text-foreground/60 mt-1">Manage attendance</p>
          </button>

          <button
            onClick={() => router.push("/leaves")}
            className="glass-card p-6 hover:bg-white/40 dark:hover:bg-white/10 transition-all group"
          >
            <div className="bg-green-500/30 p-3 rounded-lg w-fit mb-3 group-hover:bg-green-500/50 transition-all">
              <Calendar className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <p className="text-foreground font-medium text-sm">Leaves</p>
            <p className="text-xs text-foreground/60 mt-1">Apply & view leaves</p>
          </button>
        </div>

        {/* Recent Attendance */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp size={20} className="text-sky-500" />
              Recent Attendance
            </h2>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-500/20 border border-red-400/50 px-4 py-3 rounded-lg">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {attendanceLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto"></div>
            </div>
          ) : attendance.length > 0 ? (
            <div className="space-y-3">
              {attendance.map((record) => (
                <div
                  key={record.id}
                  className="flex justify-between items-center p-4 bg-white/20 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-all"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(record.clock_in_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {new Date(record.clock_in_at).toLocaleTimeString()} -{" "}
                      {record.clock_out_at ? new Date(record.clock_out_at).toLocaleTimeString() : "Ongoing"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-sky-600 dark:text-sky-400">
                      {Math.floor(record.total_seconds / 3600)}h {Math.floor((record.total_seconds % 3600) / 60)}m
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-foreground/60 text-sm py-8">No attendance records yet</p>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  )
}
