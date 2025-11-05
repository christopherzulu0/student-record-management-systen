"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { useState, useEffect } from "react"
import { StudentDashboard } from "@/components/dashboards/student-dashboard"
import { TeacherDashboard } from "@/components/dashboards/teacher-dashboard"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import type { User } from "@/lib/db"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Get user from localStorage
    const stored = localStorage.getItem("current_user")
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch (e) {
        console.error("Error parsing user from localStorage:", e)
      }
    }
  }, [])

  return (
    <ProtectedLayout>
      <div className="p-6">
        {user?.role === "student" && <StudentDashboard />}
        {user?.role === "teacher" && <TeacherDashboard />}
        {user?.role === "admin" && <AdminDashboard />}
        {!user && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Please select a user role from the login page</p>
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
