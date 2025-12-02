"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

export interface EnrollmentTrend {
  month: string
  students: number
  teachers: number
  courses: number
}

export interface PerformanceData {
  gpa: string
  count: number
}

export interface DepartmentData {
  dept: string
  enrollment: number
  avgGpa: number
}

export interface DepartmentMetric {
  name: string
  value: number
  color: string
}

export interface RecentActivity {
  id: string
  action: string
  timestamp: string
  icon: string
}

export interface SystemAlert {
  id: string
  type: "warning" | "info" | "success"
  message: string
  action: string
}

export interface AdminOverview {
  enrollmentTrends: EnrollmentTrend[]
  performanceData: PerformanceData[]
  departmentData: DepartmentData[]
  departmentMetrics: DepartmentMetric[]
  recentActivity: RecentActivity[]
  systemAlerts: SystemAlert[]
}

async function fetchAdminOverview(): Promise<AdminOverview> {
  if (typeof window === "undefined") {
    throw new Error("fetchAdminOverview can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/admin/overview`, {
    credentials: "include",
  })

  if (!response.ok) {
    const errorData = await response.json()
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    if (response.status === 403) {
      throw new Error("Forbidden - Admin access required")
    }
    throw new Error(errorData.error || "Failed to fetch admin overview")
  }

  return response.json()
}

export function useAdminOverview() {
  return useSuspenseQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchAdminOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

