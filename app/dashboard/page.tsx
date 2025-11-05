"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { useAuth } from "@/lib/auth-context"
import { StudentDashboard } from "@/components/dashboards/student-dashboard"
import { TeacherDashboard } from "@/components/dashboards/teacher-dashboard"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <ProtectedLayout>
      <div className="p-6">
        {user?.role === "student" && <StudentDashboard />}
        {user?.role === "teacher" && <TeacherDashboard />}
        {user?.role === "admin" && <AdminDashboard />}
      </div>
    </ProtectedLayout>
  )
}
