"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Home, Users, BookOpen, BarChart3, FileText, Mail, GraduationCap, UserCog, User as UserIcon, Upload } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { User } from "@/lib/db"

export function Sidebar() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Fetch user from database via API - uses Clerk session to get authenticated user
    // Role comes from database users table
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/me')
        if (!response.ok) {
          console.error("Failed to fetch user from database")
          return
        }

        const userData = await response.json()
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role, // Role fetched from database users table
          createdAt: new Date(userData.createdAt),
        })
      } catch (e) {
        console.error("Error fetching user from database:", e)
      }
    }

    fetchUser()
  }, [])

  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getMenuItems = () => {
    const baseItems = [{ href: "/dashboard", label: "Dashboard", icon: Home, section: "Main" }]

    if (user?.role === "admin") {
      return [
        ...baseItems,
        { href: "/admin/students", label: "Students", icon: Users, section: "Management" },
        { href: "/admin/teachers", label: "Teachers", icon: UserCog, section: "Management" },
        { href: "/admin/reports", label: "Reports", icon: BarChart3, section: "Management" },
      ]
    }

    if (user?.role === "teacher") {
      return [
        ...baseItems,
        { href: "/teacher/grades", label: "Grades", icon: BarChart3, section: "Academic" },
        { href: "/teacher/students", label: "My Students", icon: Users, section: "Academic" },
        { href: "/teacher/recommendations", label: "Recommendations", icon: Mail, section: "Academic" },
      ]
    }

    if (user?.role === "student") {
      return [
        ...baseItems,
        { href: "/student/grades", label: "My Grades", icon: BarChart3, section: "Academic" },
        { href: "/student/transcript", label: "Transcript", icon: FileText, section: "Academic" },
        { href: "/student/teachers", label: "My Instructors", icon: BookOpen, section: "Academic" },
        { href: "/student/recommendations", label: "Recommendations", icon: Mail, section: "Academic" },
        { href: "/student/profile", label: "Complete Profile", icon: UserIcon, section: "Account" },
        { href: "/student/documents", label: "Document Uploads", icon: Upload, section: "Account" },
      ]
    }

    return baseItems
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  const menuItems = getMenuItems()
  const groupedItems = menuItems.reduce((acc, item) => {
    const section = item.section || "Main"
    if (!acc[section]) {
      acc[section] = []
    }
    acc[section].push(item)
    return acc
  }, {} as Record<string, typeof menuItems>)

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "teacher":
        return "default"
      case "student":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-sidebar to-sidebar/95 border-r border-sidebar-border h-screen flex flex-col shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border/50 bg-gradient-to-br from-sidebar-accent/30 to-transparent flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md group-hover:bg-primary/30 transition-colors" />
            <div className="relative p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-sidebar-foreground group-hover:text-primary transition-colors">
              SARMS
            </h1>
            <p className="text-xs text-sidebar-accent-foreground/80 truncate">
              Student Academic Record System
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 min-h-0">
        <nav className="p-4 space-y-6">
          {Object.entries(groupedItems).map(([section, items]) => (
            <div key={section} className="space-y-2">
              {Object.keys(groupedItems).length > 1 && (
                <div className="px-3 py-1.5">
                  <p className="text-xs font-semibold text-sidebar-accent-foreground/60 uppercase tracking-wider">
                    {section}
                  </p>
                </div>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const active = isActive(item.href)
                  return (
          <Link
            key={item.href}
            href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground hover:translate-x-1",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                        active
                          ? "bg-gradient-to-r from-primary/20 to-primary/10 text-sidebar-accent-foreground shadow-md shadow-primary/10"
                          : "text-sidebar-foreground"
                      )}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                      )}
                      <div
                        className={cn(
                          "p-1.5 rounded-lg transition-all duration-200",
                          active
                            ? "bg-primary/20 text-primary"
                            : "bg-sidebar-accent/50 text-sidebar-foreground/70 group-hover:bg-primary/10 group-hover:text-primary"
                        )}
          >
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1">{item.label}</span>
                      {active && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
          </Link>
                  )
                })}
              </div>
            </div>
        ))}
      </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border/50 bg-sidebar-accent/20 space-y-3 flex-shrink-0">
        <div className="px-3 py-2.5 rounded-lg bg-gradient-to-br from-sidebar-accent/80 to-sidebar-accent/50 backdrop-blur-sm border border-sidebar-border/30 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-9 w-9 border-2 border-sidebar-border shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold text-sm">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-sidebar-foreground truncate">
                {user?.name || "User"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant={getRoleBadgeVariant(user?.role)}
                  className="text-xs px-1.5 py-0 h-5 font-medium"
                >
                  {user?.role?.toUpperCase() || "USER"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
