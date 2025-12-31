"use client"

import { useUser } from "@/lib/hooks/use-user"
import { StudentDashboard } from "@/components/dashboards/student-dashboard"
import { TeacherDashboard } from "@/components/dashboards/teacher-dashboard"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"

export function DashboardContent() {
  const { data: user } = useUser()

  // Route to the appropriate dashboard based on user role
  switch (user.role) {
    case "student":
      return <StudentDashboard />
    case "teacher":
      return <TeacherDashboard />
    case "admin":
      return <AdminDashboard />
    case "parent":
      // Parent dashboard will be implemented separately
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-6">
            <h1 className="text-2xl font-bold mb-2">Parent Dashboard</h1>
            <p className="text-muted-foreground">
              Parent dashboard is coming soon.
            </p>
          </div>
        </div>
      )
    default:
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-6">
            <h1 className="text-2xl font-bold text-destructive mb-2">Unknown Role</h1>
            <p className="text-muted-foreground">
              Your account has an unrecognized role: {user.role}
            </p>
          </div>
        </div>
      )
  }
}

