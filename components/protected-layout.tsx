"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "./sidebar"

interface ProtectedLayoutProps {
  children: React.ReactNode
  allowedRoles?: Array<"student" | "teacher" | "admin">
}

export function ProtectedLayout({ children, allowedRoles }: ProtectedLayoutProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is set and has a role that's not allowed, show message
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">You don't have access to this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-0 h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
