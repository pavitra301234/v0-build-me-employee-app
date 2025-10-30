"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Clock, Calendar, User, LogOut } from "lucide-react"
import { useAuth } from "./auth-context"

export function Navigation() {
  const pathname = usePathname()
  const { logout } = useAuth()

  if (pathname === "/login") return null

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/attendance", label: "Attendance", icon: Clock },
    { href: "/leaves", label: "Leaves", icon: Calendar },
    { href: "/profile", label: "Profile", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
              pathname === href ? "text-blue-600 border-t-2 border-blue-600" : "text-gray-600"
            }`}
          >
            <Icon size={24} />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-gray-600"
        >
          <LogOut size={24} />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </nav>
  )
}
