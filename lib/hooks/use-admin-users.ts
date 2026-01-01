"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

export interface AdminUser {
  id: string
  userId: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

export interface AdminUsersStatistics {
  total: number
  students: number
  teachers: number
  admins: number
}

export interface AdminUsersResponse {
  users: AdminUser[]
  statistics: AdminUsersStatistics
}

async function fetchAdminUsers(): Promise<AdminUsersResponse> {
  // Ensure we're on the client side - useSuspenseQuery in client components
  // may still attempt to execute during SSR, so we need this check
  if (typeof window === "undefined") {
    // Throw an error that will cause Suspense to catch and retry on the client
    // This is expected behavior for client-only data fetching
    throw new Promise(() => {
      // Never resolves, causing Suspense to wait and Next.js to switch to client rendering
    })
  }

  // Use absolute URL for client-side fetching
  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/admin/users`, {
    credentials: "include", // Include cookies for authentication
  })

  if (!response.ok) {
    const errorData = await response.json()
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    if (response.status === 403) {
      throw new Error("Forbidden - Admin access required")
    }
    throw new Error(errorData.error || "Failed to fetch admin users")
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

