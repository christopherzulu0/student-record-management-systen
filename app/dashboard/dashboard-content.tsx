"use client"

import { Suspense } from "react"
import { StudentDashboard } from "@/components/dashboards/student-dashboard"
import { StudentDashboardSkeleton } from "@/components/dashboards/StudentDashboardSkeleton"
import { TeacherDashboard } from "@/components/dashboards/teacher-dashboard"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { useUser } from "@/lib/hooks/use-user"
import ParentDashboard from "@/components/ParentDashboard"
import { ParentDashboardSkeleton } from "@/components/ParentDashboardSkeleton"

export function DashboardContent() {
  const { data: user } = useUser()

  return (
    <div className="p-6">
      {user.role === "student" && (
        <Suspense fallback={<StudentDashboardSkeleton />}>
          <StudentDashboard />
        </Suspense>
      )}
      {user.role === "teacher" && <TeacherDashboard />}
      {user.role === "admin" && <AdminDashboard />}
      {user.role === "parent" && (
        <Suspense fallback={<ParentDashboardSkeleton />}>
          <ParentDashboard />
        </Suspense>
      )}
    </div>
  )
}

