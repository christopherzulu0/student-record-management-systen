"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

export interface AdminStudent {
  id: string
  studentModelId: string
  name: string
  email: string
  average: number
  enrolled: string
  status: "active" | "at-risk" | "suspended" | "inactive"
  credits: number
}

export interface AdminStudentsStatistics {
  total: number
  active: number
  atRisk: number
  avgAverage: number
}

export interface AdminStudentsResponse {
  students: AdminStudent[]
  statistics: AdminStudentsStatistics
}

async function fetchAdminStudents(): Promise<AdminStudentsResponse> {
  if (typeof window === "undefined") {
    throw new Error("fetchAdminStudents can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/admin/students`, {
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
    throw new Error(errorData.error || "Failed to fetch students")
  }

  return response.json()
}

export function useAdminStudents() {
  return useSuspenseQuery({
    queryKey: ["admin-students"],
    queryFn: fetchAdminStudents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

