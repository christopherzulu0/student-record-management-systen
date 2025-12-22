"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

export interface Department {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

async function fetchDepartments(): Promise<Department[]> {
  if (typeof window === "undefined") {
    throw new Error("fetchDepartments can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/departments`, {
    credentials: "include",
  })

  if (!response.ok) {
    const errorData = await response.json()
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    throw new Error(errorData.error || "Failed to fetch departments")
  }

  return response.json()
}

export function useDepartments() {
  return useSuspenseQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  })
}

