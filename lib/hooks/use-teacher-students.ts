"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

export type DocumentStatus = "pending" | "uploaded" | "approved" | "rejected" | "expired"

export interface StudentDocument {
  id: string
  name: string
  description: string
  required: boolean
  status: DocumentStatus
  uploadedDate?: string
  fileName?: string
  fileSize?: string
}

export interface Student {
  id: string
  name: string
  email: string
  gpa: number
  grade: string
  status: string
  trend: string
  documents?: StudentDocument[]
}

export interface StudentsStatistics {
  total: number
  excellent: number
  goodStanding: number
  atRisk: number
}

export interface TeacherStudentsResponse {
  students: Student[]
  statistics: StudentsStatistics
}

async function fetchTeacherStudents(): Promise<TeacherStudentsResponse> {
  // Use absolute URL for client-side, relative for server-side
  const url = typeof window !== "undefined" 
    ? `${window.location.origin}/api/teacher/students`
    : "/api/teacher/students"
  
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
    if (response.status === 404) {
      throw new Error("Teacher record not found")
    }
    throw new Error(errorData.error || "Failed to fetch teacher students")
  }

  return response.json()
}

export function useTeacherStudents() {
  return useSuspenseQuery({
    queryKey: ["teacher-students"],
    queryFn: fetchTeacherStudents,
    staleTime: 60 * 1000, // 1 minute
  })
}

