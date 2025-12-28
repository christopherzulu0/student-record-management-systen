"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

export interface StudentGrade {
  id: string
  course: string
  courseCode: string
  courseName: string
  grade: string
  score: number
  credits: number
  semester: string
  semesterId: string
}

export interface StudentGradesStatistics {
  average: number
  creditsEarned: number
  totalCreditsRequired: number
  averageGrade: string
}

export interface GradeProgressionData {
  course: string
  assignment1?: number
  assignment2?: number
  assignment3?: number
}

export interface StudentGradesResponse {
  grades: StudentGrade[]
  statistics: StudentGradesStatistics
  semesters: string[]
  gradeProgressionData: GradeProgressionData[]
}

async function fetchStudentGrades(): Promise<StudentGradesResponse> {
  // Ensure we're on the client side
  if (typeof window === "undefined") {
    throw new Error("fetchStudentGrades can only be called on the client side")
  }

  // Use absolute URL for client-side fetching
  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/student/grades`, {
    credentials: "include", // Include cookies for authentication
  })

  if (!response.ok) {
    const errorData = await response.json()
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    if (response.status === 403) {
      throw new Error("Forbidden - Student access required")
    }
    throw new Error(errorData.error || "Failed to fetch student grades")
  }

  return response.json()
}

export function useStudentGrades() {
  return useSuspenseQuery({
    queryKey: ["student-grades"],
    queryFn: fetchStudentGrades,
  })
}

