"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { MapPin, AlertCircle, CheckCircle } from "lucide-react"

interface AttendanceRecord {
  id: string
  clock_in_at: string
  clock_out_at: string | null
  total_seconds: number
}

export default function AttendancePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await apiClient.getLatestAttendance(10)
        setAttendance(data.records || [])

        const today = new Date().toDateString()
        const todayRecord = data.records?.find(
          (r: AttendanceRecord) => new Date(r.clock_in_at).toDateString() === today,
        )
        setIsClockedIn(!!todayRecord && !todayRecord.clock_out_at)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load attendance")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchAttendance()
    }
  }, [user])

  const getLocation = (): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`))
        },
      )
    })
  }

  const handleClockIn = async () => {
    setError("")
    setSuccess("")
    try {
      const loc = await getLocation()
      setLocation(loc)
      await apiClient.clockIn({
        lat: loc.lat,
        lon: loc.lon,
        device: "mobile",
      })
      setSuccess("Clocked in successfully!")
      setIsClockedIn(true)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clock in failed")
    }
  }

  const handleClockOut = async () => {
    setError("")
    setSuccess("")
    try {
      const loc = await getLocation()
      setLocation(loc)
      await apiClient.clockOut({
        lat: loc.lat,
        lon: loc.lon,
        device: "mobile",
      })
      setSuccess("Clocked out successfully!")
      setIsClockedIn(false)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clock out failed")
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-blue-100 text-sm mt-1">Track your daily attendance</p>
      </div>

      <div className="p-4 space-y-4">
        <Card className="p-6 bg-white">
          <div className="text-center mb-6">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isClockedIn ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <Clock size={32} className={isClockedIn ? "text-green-600" : "text-gray-600"} />
            </div>
            <p className="text-gray-600 text-sm mb-2">Status</p>
            <p className="text-2xl font-bold text-gray-900">{isClockedIn ? "Clocked In" : "Clocked Out"}</p>
          </div>

          {location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded">
              <MapPin size={16} />
              <span>
                Lat: {location.lat.toFixed(4)}, Lon: {location.lon.toFixed(4)}
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-4 p-3 bg-red-50 rounded">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm mb-4 p-3 bg-green-50 rounded">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleClockIn}
              disabled={isClockedIn}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
            >
              Clock In
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={!isClockedIn}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
            >
              Clock Out
            </Button>
          </div>
        </Card>

        <Card className="p-4 bg-white">
          <h2 className="font-semibold text-gray-900 mb-4">Attendance History</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : attendance.length > 0 ? (
            <div className="space-y-3">
              {attendance.map((record) => (
                <div key={record.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(record.clock_in_at).toLocaleDateString()}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        record.clock_out_at ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {record.clock_out_at ? "Completed" : "Ongoing"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {new Date(record.clock_in_at).toLocaleTimeString()} -{" "}
                    {record.clock_out_at ? new Date(record.clock_out_at).toLocaleTimeString() : "Ongoing"}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    Duration: {Math.floor(record.total_seconds / 3600)}h{" "}
                    {Math.floor((record.total_seconds % 3600) / 60)}m
                  </p>
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

function Clock({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  )
}
