"use client"

import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface Parent {
  id: string
  parentId: string
  parentUserId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  relationship?: string
  isPrimary: boolean
  canViewGrades: boolean
  canViewAttendance: boolean
  canViewDocuments: boolean
}

export interface StudentWithParents {
  id: string
  studentId: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  program?: string
  yearOfStudy?: number
  cumulativeGPA?: number
  status: string
  parents: Parent[]
}

export interface ParentsStatistics {
  total: number
  withParents: number
  withoutParents: number
}

export interface TeacherParentsResponse {
  students: StudentWithParents[]
  statistics: ParentsStatistics
}

async function fetchTeacherParents(): Promise<TeacherParentsResponse> {
  const url = typeof window !== "undefined" 
    ? `${window.location.origin}/api/teacher/parents`
    : "/api/teacher/parents"
  
  const response = await fetch(url, {
    credentials: "include",
    cache: "no-store",
  })

  if (!response.ok) {
    const errorData = await response.json()
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    if (response.status === 403) {
      throw new Error("Forbidden - Teacher access required")
    }
    throw new Error(errorData.error || "Failed to fetch students with parents")
  }

  return response.json()
}

export function useTeacherParents() {
  return useSuspenseQuery({
    queryKey: ["teacher-parents"],
    queryFn: fetchTeacherParents,
    staleTime: 60 * 1000, // 1 minute
  })
}

export interface AddParentData {
  studentId: string
  parentEmail: string
  relationship?: string
  isPrimary?: boolean
  canViewGrades?: boolean
  canViewAttendance?: boolean
  canViewDocuments?: boolean
}

async function addParentToStudent(data: AddParentData): Promise<{ message: string; parentStudent: Parent }> {
  const url = typeof window !== "undefined" 
    ? `${window.location.origin}/api/teacher/parents`
    : "/api/teacher/parents"
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to add parent to student")
  }

  return response.json()
}

export function useAddParentToStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addParentToStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-parents"] })
      toast.success("Parent added to student successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add parent to student")
    },
  })
}

export interface UpdateParentData {
  relationship?: string
  isPrimary?: boolean
  canViewGrades?: boolean
  canViewAttendance?: boolean
  canViewDocuments?: boolean
}

async function updateParentStudent(
  id: string,
  data: UpdateParentData
): Promise<{ message: string; parentStudent: Parent }> {
  const url = typeof window !== "undefined" 
    ? `${window.location.origin}/api/teacher/parents/${id}`
    : `/api/teacher/parents/${id}`
  
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to update parent-student relationship")
  }

  return response.json()
}

export function useUpdateParentStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateParentData }) => updateParentStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-parents"] })
      toast.success("Parent-student relationship updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update parent-student relationship")
    },
  })
}

async function removeParentFromStudent(id: string): Promise<{ message: string }> {
  const url = typeof window !== "undefined" 
    ? `${window.location.origin}/api/teacher/parents/${id}`
    : `/api/teacher/parents/${id}`
  
  const response = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to remove parent from student")
  }

  return response.json()
}

export function useRemoveParentFromStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeParentFromStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-parents"] })
      toast.success("Parent removed from student successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove parent from student")
    },
  })
}

