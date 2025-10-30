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
    <nav className="fixed bottom-0 left-0 right-0 glass-dark z-50 border-t border-white/20">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
              pathname === href
                ? "text-sky-600 dark:text-sky-400 border-t-2 border-sky-600 dark:border-sky-400"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <Icon size={24} />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-foreground/60 hover:text-foreground transition-all"
        >
          <LogOut size={24} />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </nav>
  )
}
