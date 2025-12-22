"use client"

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"

export interface CreateCourseData {
  courseCode: string
  name: string
  description?: string | null
  credits?: number
  departmentId?: string
}

export interface Course {
  id: string
  courseCode: string
  name: string
  description: string | null
  credits: number
  department: string | null
  departmentId: string | null
  status: string
  teacherId: string | null
  teacher: string | null
  departmentName: string | null
  enrolledStudents: number
  createdAt: string
  updatedAt: string
}

async function createCourse(data: CreateCourseData): Promise<Course> {
  if (typeof window === "undefined") {
    throw new Error("createCourse can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/courses`, {
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
      const errorMessage = errorData.details || errorData.error || "Course code already exists"
      throw new Error(errorMessage)
    }
    throw new Error(errorData.error || "Failed to create course")
  }

  return response.json()
}

async function fetchCourses(): Promise<Course[]> {
  if (typeof window === "undefined") {
    throw new Error("fetchCourses can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/courses`, {
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
    throw new Error(errorData.error || "Failed to fetch courses")
  }

  return response.json()
}

export interface UpdateCourseData {
  courseCode: string
  name: string
  description?: string | null
  credits?: number
  departmentId?: string
  status?: string
  teacherId?: string | null
}

async function updateCourse(id: string, data: UpdateCourseData): Promise<Course> {
  if (typeof window === "undefined") {
    throw new Error("updateCourse can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/courses/${id}`, {
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
      throw new Error("Course not found")
    }
    if (response.status === 409) {
      const errorMessage = errorData.details || errorData.error || "Course code already exists"
      throw new Error(errorMessage)
    }
    if (response.status === 400) {
      throw new Error(errorData.error || "Invalid course data")
    }
    throw new Error(errorData.error || "Failed to update course")
  }

  return response.json()
}

async function deleteCourse(id: string): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("deleteCourse can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/courses/${id}`, {
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
      throw new Error("Course not found")
    }
    if (response.status === 409) {
      const errorMessage = errorData.details || errorData.error || "Cannot delete course with related data"
      throw new Error(errorMessage)
    }
    throw new Error(errorData.error || "Failed to delete course")
  }
}

export function useCourses() {
  return useSuspenseQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      // Invalidate courses query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseData }) => updateCourse(id, data),
    onSuccess: () => {
      // Invalidate courses query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      // Invalidate courses query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })
}

