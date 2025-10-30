const API_BASE_URL = "https://hrms-2-y7li.onrender.com"

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  access_token: string
  token_type: string
  expires_at: string
  role: string
}

interface ClockRequest {
  lat: number
  lon: number
  device: string
}

interface AttendanceRecord {
  id: string
  user_id: string
  employee_email: string
  clock_in_at: string
  clock_out_at: string | null
  total_seconds: number
  created_at: string
}

interface AttendanceLatestResponse {
  records: AttendanceRecord[]
}

class ApiClient {
  private getAuthHeaders() {
    if (typeof window === "undefined") return {}
    const token = localStorage.getItem("access_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token")
          localStorage.removeItem("user_data")
          localStorage.removeItem("expires_at")
          window.location.href = "/login"
        }
        throw new Error("Session expired. Please login again.")
      }

      const error = await response.json().catch(() => ({ detail: "Request failed" }))
      const errorMessage = error.detail || error.message || `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async clockIn(data: ClockRequest): Promise<string> {
    return this.request<string>("/attendance/clockin", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async clockOut(data: ClockRequest): Promise<string> {
    return this.request<string>("/attendance/clockout", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getLatestAttendance(limit = 10): Promise<AttendanceLatestResponse> {
    const params = new URLSearchParams()
    params.append("limit", limit.toString())
    const query = params.toString()
    const endpoint = `/attendance/latest${query ? `?${query}` : ""}`
    return this.request<AttendanceLatestResponse>(endpoint)
  }

  async getMyLeaves(): Promise<any[]> {
    return this.request("/leaves/my")
  }

  async getLeaveBalance(): Promise<any> {
    return this.request("/leaves/balance")
  }

  async applyLeave(data: any, file?: File): Promise<any> {
    const formData = new FormData()
    formData.append("leave_type_id", data.leave_type_id.toString())
    formData.append("start_date", data.start_date)
    formData.append("end_date", data.end_date)
    formData.append("half_day", data.half_day.toString())
    if (data.half_day_slot) formData.append("half_day_slot", data.half_day_slot)
    formData.append("reason", data.reason)

    if (file) {
      formData.append("file", file)
    }

    const url = `${API_BASE_URL}/leaves/apply`
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.clear()
          window.location.href = "/login"
        }
        throw new Error("Session expired. Please login again.")
      }

      const error = await response.json().catch(() => ({ message: "Request failed" }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
export type { LoginRequest, LoginResponse, ClockRequest, AttendanceRecord, AttendanceLatestResponse }
