"use client"

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"

export interface CreateSemesterData {
  name: string // e.g., "Fall 2025"
  startDate: string // ISO date string
  endDate: string // ISO date string
  isActive?: boolean
}

export interface Semester {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

async function fetchSemesters(): Promise<Semester[]> {
  if (typeof window === "undefined") {
    throw new Error("fetchSemesters can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/semesters`, {
    credentials: "include",
  })

  if (!response.ok) {
    const errorData = await response.json()
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    throw new Error(errorData.error || "Failed to fetch semesters")
  }

  return response.json()
}

async function createSemester(data: CreateSemesterData): Promise<Semester> {
  if (typeof window === "undefined") {
    throw new Error("createSemester can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/semesters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    if (response.status === 403) {
      throw new Error("Forbidden - Admin access required")
    }
    if (response.status === 409) {
      const errorMessage = errorData.details || errorData.error || "Semester name already exists"
      throw new Error(errorMessage)
    }
    if (response.status === 400) {
      throw new Error(errorData.error || "Invalid semester data")
    }
    throw new Error(errorData.error || "Failed to create semester")
  }

  return response.json()
}

export function useSemesters() {
  return useSuspenseQuery({
    queryKey: ["semesters"],
    queryFn: fetchSemesters,
  })
}

export interface UpdateSemesterData {
  name: string
  startDate: string
  endDate: string
  isActive?: boolean
}

async function updateSemester(id: string, data: UpdateSemesterData): Promise<Semester> {
  if (typeof window === "undefined") {
    throw new Error("updateSemester can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/semesters/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    if (response.status === 403) {
      throw new Error("Forbidden - Admin access required")
    }
    if (response.status === 404) {
      throw new Error("Semester not found")
    }
    if (response.status === 409) {
      const errorMessage = errorData.details || errorData.error || "Semester name already exists"
      throw new Error(errorMessage)
    }
    if (response.status === 400) {
      throw new Error(errorData.error || "Invalid semester data")
    }
    throw new Error(errorData.error || "Failed to update semester")
  }

  return response.json()
}

async function deleteSemester(id: string): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("deleteSemester can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/semesters/${id}`, {
    method: "DELETE",
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
    if (response.status === 404) {
      throw new Error("Semester not found")
    }
    if (response.status === 409) {
      const errorMessage = errorData.details || errorData.error || "Cannot delete semester with related data"
      throw new Error(errorMessage)
    }
    throw new Error(errorData.error || "Failed to delete semester")
  }
}

export function useCreateSemester() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSemester,
    onSuccess: () => {
      // Invalidate semesters query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["semesters"] })
    },
  })
}

export function useUpdateSemester() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSemesterData }) => updateSemester(id, data),
    onSuccess: () => {
      // Invalidate semesters query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["semesters"] })
    },
  })
}

export function useDeleteSemester() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSemester,
    onSuccess: () => {
      // Invalidate semesters query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["semesters"] })
    },
  })
}

