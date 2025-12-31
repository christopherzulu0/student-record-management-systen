"use client"

import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface StudentGrade {
  id: string
  studentModelId?: string // Student model ID for API calls
  studentId: string
  name: string
  course: string
  currentGrade: number
  attendance: number | null // Can be null if not set
  trend: "up" | "down" | "stable"
  semesterId?: string
  semesterName?: string
  assignmentType?: string
  comments?: string | null
}

export interface CourseStatistics {
  total: number
  avgGrade: number
  avgAttendance: number
  excellentCount: number
  needsHelpCount: number
}

export interface CourseGrades {
  courseId: string
  courseCode: string
  courseName: string
  students: StudentGrade[]
  statistics: CourseStatistics
}

export interface Course {
  id: string
  courseCode: string
  name: string
  displayName: string
}

export interface TeacherGradesResponse {
  courses: Course[]
  gradesByCourse: Record<string, CourseGrades>
}

async function fetchTeacherGrades(): Promise<TeacherGradesResponse> {
  // Use absolute URL for client-side, relative for server-side
  const url = typeof window !== "undefined" 
    ? `${window.location.origin}/api/teacher/grades`
    : "/api/teacher/grades"
  
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
    throw new Error(errorData.error || "Failed to fetch teacher grades")
  }

  return response.json()
}

export interface RecordGradeData {
  studentId: string // Student model ID
  courseId: string
  semesterId: string
  score: number
  attendance?: number | null
  trend?: "up" | "down" | "stable"
  comments?: string
  assignmentType?: string
}

export interface RecordGradeResponse {
  message: string
  grade: {
    id: string
    studentId: string
    studentName: string
    courseCode: string
    courseName: string
    semesterName: string
    score: number
    letterGrade: string
    attendance: number | null
    trend: string | null
  }
}

async function recordGrade(data: RecordGradeData): Promise<RecordGradeResponse> {
  const url = typeof window !== "undefined" 
    ? `${window.location.origin}/api/teacher/grades`
    : "/api/teacher/grades"
  
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
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    if (response.status === 403) {
      throw new Error("Forbidden - Teacher access required")
    }
    if (response.status === 404) {
      throw new Error(errorData.error || "Student or course not found")
    }
    if (response.status === 400) {
      throw new Error(errorData.error || "Invalid grade data")
    }
    throw new Error(errorData.error || "Failed to record grade")
  }

  return response.json()
}

export function useTeacherGrades() {
  return useSuspenseQuery({
    queryKey: ["teacher-grades"],
    queryFn: fetchTeacherGrades,
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useRecordGrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: recordGrade,
    onSuccess: () => {
      // Invalidate and refetch grades data
      queryClient.invalidateQueries({ queryKey: ["teacher-grades"] })
    },
  })
}

export interface BulkRecordGradeData {
  courseId: string
  semesterId: string
  studentGrades: Array<{
    studentId: string
    score: number
    attendance?: number | null
    trend?: "up" | "down" | "stable"
    assignmentType?: string
  }>
}

export interface BulkRecordGradeResponse {
  message: string
  results: Array<{
    studentId: string
    studentName: string
    grade: number
    letterGrade: string | null
  }>
  errors?: Array<{
    studentId: string
    studentName: string
    error: string
  }>
  total: number
  successful: number
  failed: number
}

async function bulkRecordGrades(data: BulkRecordGradeData): Promise<BulkRecordGradeResponse> {
  const url = typeof window !== "undefined" 
    ? `${window.location.origin}/api/teacher/grades/bulk`
    : "/api/teacher/grades/bulk"
  
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
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    if (response.status === 403) {
      throw new Error(errorData.details || errorData.error || "Forbidden - You do not have permission to record grades for this course")
    }
    if (response.status === 404) {
      throw new Error(errorData.error || "Course, semester, or students not found")
    }
    if (response.status === 400) {
      throw new Error(errorData.error || "Invalid grade data")
    }
    throw new Error(errorData.error || "Failed to bulk record grades")
  }

  return response.json()
}

export function useBulkRecordGrades() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkRecordGrades,
    onSuccess: () => {
      // Invalidate and refetch grades data
      queryClient.invalidateQueries({ queryKey: ["teacher-grades"] })
    },
  })
}

