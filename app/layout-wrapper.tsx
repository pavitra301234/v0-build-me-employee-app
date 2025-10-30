"use client"

import type React from "react"

import { AuthProvider } from "@/components/auth-context"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
