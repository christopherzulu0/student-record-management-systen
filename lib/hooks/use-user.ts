"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import type { User } from "@/lib/db"

async function fetchUser(): Promise<User> {
  // Ensure we're on the client side
  if (typeof window === "undefined") {
    throw new Error("fetchUser can only be called on the client side")
  }

  // Use absolute URL for client-side fetching
  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/user/me`, {
    credentials: "include", // Include cookies for authentication
  })

  if (!response.ok) {
    const errorData = await response.json()
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    throw new Error(errorData.error || "Failed to fetch user from database")
  }

  const userData = await response.json()
  return {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    createdAt: new Date(userData.createdAt),
  }
}

export function useUser() {
  return useSuspenseQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  })
}

