"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

export interface AdminTeacher {
  id: string
  teacherModelId: string
  name: string
  email: string
  department: string
  courses: number
  status: "active" | "on-leave" | "inactive"
  rating: number
}

export interface AdminTeachersStatistics {
  total: number
  active: number
  avgRating: number
  totalCourses: number
}

export interface AdminTeachersResponse {
  teachers: AdminTeacher[]
  statistics: AdminTeachersStatistics
  departments: string[]
}

async function fetchAdminTeachers(): Promise<AdminTeachersResponse> {
  if (typeof window === "undefined") {
    throw new Error("fetchAdminTeachers can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/admin/teachers`, {
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
    throw new Error(errorData.error || "Failed to fetch teachers")
  }

  return response.json()
}

export function useAdminTeachers() {
  return useSuspenseQuery({
    queryKey: ["admin-teachers"],
    queryFn: fetchAdminTeachers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

