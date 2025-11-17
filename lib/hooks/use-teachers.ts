"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

export interface Teacher {
  id: string
  teacherId: string | null
  userId: string
  name: string
  email: string
  firstName: string
  lastName: string
  department: string | null
  rating: number | null
  status: string
}

async function fetchTeachers(): Promise<Teacher[]> {
  if (typeof window === "undefined") {
    throw new Error("fetchTeachers can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/teachers`, {
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

export function useTeachers() {
  return useSuspenseQuery({
    queryKey: ["teachers"],
    queryFn: fetchTeachers,
  })
}

