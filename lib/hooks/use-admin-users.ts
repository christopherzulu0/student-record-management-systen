"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

export interface AdminUser {
  id: string
  userId: string
  name: string
  email: string
  role: "student" | "teacher" | "admin"
  status: string
  createdAt: string
}

export interface AdminUsersData {
  users: AdminUser[]
  statistics: {
    total: number
    students: number
    teachers: number
    admins: number
  }
}

async function fetchAdminUsers(): Promise<AdminUsersData> {
  if (typeof window === "undefined") {
    throw new Error("fetchAdminUsers can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/admin/users`, {
    credentials: "include",
  })

  if (!response.ok) {
    let errorData: any = {}
    const contentType = response.headers.get("content-type")
    
    try {
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json()
      } else {
        const text = await response.text()
        errorData = { error: text || `HTTP ${response.status}: ${response.statusText}` }
      }
    } catch (parseError) {
      console.error("[useAdminUsers] Failed to parse error response:", parseError)
      errorData = { 
        error: `HTTP ${response.status}: ${response.statusText}`,
        parseError: parseError instanceof Error ? parseError.message : String(parseError)
      }
    }
    
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    if (response.status === 403) {
      throw new Error("Forbidden - Admin access required")
    }
    
    const errorMessage = errorData.error || errorData.details || "Failed to fetch users"
    console.error("[useAdminUsers] API Error:", {
      status: response.status,
      statusText: response.statusText,
      error: errorMessage,
      errorData: errorData,
      url: `${baseUrl}/api/admin/users`,
    })
    throw new Error(errorMessage)
  }

  return response.json()
}

export function useAdminUsers() {
  return useSuspenseQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
