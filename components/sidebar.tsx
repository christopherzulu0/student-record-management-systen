"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Home,
  Users,
  BookOpen,
  BarChart3,
  FileText,
  Mail,
  GraduationCap,
  UserCog,
  User as UserIcon,
  Upload,
  ChevronDown,
  Circle,
  Sparkles,
  Users2
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { User } from "@/lib/db"

export function Sidebar() {
  const [user, setUser] = useState<User | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
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
        { href: "/admin/users", label: "Users", icon: Users2, section: "Management" },
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

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
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

  const getRoleGradient = (role?: string) => {
    switch (role) {
      case "admin":
        return "from-red-500/20 via-orange-500/20 to-red-500/20"
      case "teacher":
        return "from-blue-500/20 via-indigo-500/20 to-blue-500/20"
      case "student":
        return "from-teal-500/20 via-cyan-500/20 to-teal-500/20"
      default:
        return "from-gray-500/20 via-slate-500/20 to-gray-500/20"
    }
  }

  return (
    <aside className="relative w-64 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/98 border-r border-sidebar-border/50 h-screen flex flex-col shadow-2xl overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-30 pointer-events-none animate-gradient-rotate",
        getRoleGradient(user?.role)
      )} />

      {/* Header */}
      <div className="relative p-6 border-b border-sidebar-border/30 backdrop-blur-sm flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar-accent/10 via-transparent to-primary/5" />
        <Link href="/dashboard" className="relative flex items-center gap-3 group">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl group-hover:bg-primary/50 transition-all duration-500 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Icon container */}
            <div className="relative p-3 bg-gradient-to-br from-primary via-primary/90 to-accent rounded-2xl shadow-2xl group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <GraduationCap className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-sidebar-foreground to-sidebar-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all duration-300">
                SARMS
              </h1>
              <Sparkles className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors animate-pulse" />
            </div>
            <p className="text-xs text-sidebar-foreground/60 truncate font-medium">
              Academic Record System
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 min-h-0 relative">
        <nav className="p-3 space-y-1">
          {Object.entries(groupedItems).map(([section, items]) => {
            const isCollapsed = collapsedSections[section]
            const hasActiveItem = items.some(item => isActive(item.href))

            return (
              <div key={section} className="space-y-1">
                {Object.keys(groupedItems).length > 1 && (
                  <button
                    onClick={() => toggleSection(section)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-sidebar-accent/10 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1 h-1 rounded-full transition-all duration-300",
                        hasActiveItem ? "bg-primary w-2 h-2" : "bg-sidebar-foreground/30"
                      )} />
                      <p className={cn(
                        "text-xs font-bold uppercase tracking-wider transition-colors",
                        hasActiveItem ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70"
                      )}>
                        {section}
                      </p>
                    </div>
                    <ChevronDown className={cn(
                      "w-3.5 h-3.5 text-sidebar-foreground/40 transition-transform duration-300",
                      isCollapsed ? "-rotate-90" : "rotate-0"
                    )} />
                  </button>
                )}

                <div className={cn(
                  "space-y-0.5 overflow-hidden transition-all duration-300",
                  isCollapsed ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
                )}>
                  {items.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                          "hover:translate-x-1",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                          active
                            ? "bg-gradient-to-r from-primary/15 via-primary/10 to-transparent text-sidebar-foreground shadow-lg shadow-primary/5"
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/10"
                        )}
                      >
                        {/* Active indicator bar */}
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary via-accent to-primary rounded-r-full shadow-lg shadow-primary/50" />
                        )}

                        {/* Icon container with glow */}
                        <div className="relative">
                          {active && (
                            <div className="absolute inset-0 bg-primary/30 rounded-lg blur-md" />
                          )}
                          <div
                            className={cn(
                              "relative p-2 rounded-lg transition-all duration-300",
                              active
                                ? "bg-gradient-to-br from-primary/20 to-accent/20 text-primary shadow-md"
                                : "bg-sidebar-accent/30 text-sidebar-foreground/60 group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-110"
                            )}
                          >
                            <item.icon className="w-4 h-4" />
                          </div>
                        </div>

                        <span className="flex-1 font-medium">{item.label}</span>

                        {/* Active pulse indicator */}
                        {active && (
                          <div className="relative">
                            <Circle className="w-2 h-2 fill-primary text-primary animate-pulse" />
                            <div className="absolute inset-0 bg-primary/50 rounded-full blur-sm animate-pulse" />
                          </div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer - User Profile */}
      <div className="relative p-4 border-t border-sidebar-border/30 backdrop-blur-sm flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar-accent/5 to-transparent" />

        <div className="relative group">
          {/* Glassmorphism card */}
          <div className="absolute inset-0 bg-gradient-to-br from-sidebar-accent/20 to-sidebar-accent/5 rounded-2xl blur-xl group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-500" />

          <div className="relative px-3 py-3 rounded-2xl bg-gradient-to-br from-sidebar-accent/30 via-sidebar-accent/20 to-transparent backdrop-blur-md border border-sidebar-border/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-primary/30">
            <div className="flex items-center gap-3">
              {/* Avatar with status indicator */}
              <div className="relative">
                <Avatar className="h-11 w-11 border-2 border-sidebar-border/50 shadow-lg ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                  <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-accent text-white font-bold text-sm shadow-inner">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                {/* Online status indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-sidebar shadow-lg">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-sidebar-foreground truncate group-hover:text-primary transition-colors">
                  {user?.name || "User"}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge
                    variant={getRoleBadgeVariant(user?.role)}
                    className="text-xs px-2 py-0.5 h-5 font-bold shadow-md hover:shadow-lg transition-shadow"
                  >
                    {user?.role?.toUpperCase() || "USER"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
