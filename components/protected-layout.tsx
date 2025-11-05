"use client"

import type React from "react"

import { Sidebar } from "./sidebar"

interface ProtectedLayoutProps {
  children: React.ReactNode
  allowedRoles?: Array<"student" | "teacher" | "admin">
}

export function ProtectedLayout({ children, allowedRoles }: ProtectedLayoutProps) {
  // Since authentication was removed, we just render the layout
  // Role checking can be implemented later if needed with a different approach
  return (
    <div className="flex gap-0 h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
