"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

export interface AdminStats {
  totalStudents: number
  totalTeachers: number
  totalCourses: number
  averageAverage: number
  atRiskStudents: number
  studentsAddedThisMonth: number
}

async function fetchAdminStats(): Promise<AdminStats> {
  if (typeof window === "undefined") {
    throw new Error("fetchAdminStats can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/admin/stats`, {
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
    throw new Error(errorData.error || "Failed to fetch admin stats")
  }

  return response.json()
}

export function useAdminStats() {
  return useSuspenseQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    staleTime: 60 * 1000, // 1 minute
  })
}

