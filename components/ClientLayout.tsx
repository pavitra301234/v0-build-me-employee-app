"use client"

import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/components/auth-context"

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <AuthProvider>{children}</AuthProvider>
      <Analytics />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js').catch(() => {});
              });
            }
          `,
        }}
      />
    </>
  )
}
