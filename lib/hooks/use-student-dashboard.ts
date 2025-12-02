"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

export interface CourseGrade {
  name: string
  grade: number
  target: number
  trend: "up" | "down" | "stable"
}

export interface GPAHistory {
  semester: string
  gpa: number
  courses: number
}

export interface CreditData {
  name: string
  value: number
  fill: string
}

export interface PerformanceData {
  name: string
  score: number
  class_avg: number
}

export interface AcademicAlert {
  id: number
  type: "success" | "warning" | "info"
  message: string
}

export interface StudentDashboardData {
  name: string
  studentId: string
  currentGPA: number
  creditsEarned: number
  creditsInProgress: number
  creditsRemaining: number
  totalCreditsRequired: number
  courseAverage: number
  classRank: number
  totalStudents: number
  completionPercentage: number
  courseGrades: CourseGrade[]
  gpaHistory: GPAHistory[]
  creditData: CreditData[]
  performanceData: PerformanceData[]
  academicAlerts: AcademicAlert[]
  upcomingAssignments: any[]
  schedule: any[]
  documents: any[]
}

async function fetchStudentDashboard(): Promise<StudentDashboardData> {
  if (typeof window === "undefined") {
    throw new Error("fetchStudentDashboard can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/student/dashboard`, {
    credentials: "include",
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    if (response.status === 403) {
      throw new Error("Forbidden - Student access required")
    }
    throw new Error(errorData.error || "Failed to fetch student dashboard")
  }

  return response.json()
}

export function useStudentDashboard() {
  return useSuspenseQuery({
    queryKey: ["student-dashboard"],
    queryFn: fetchStudentDashboard,
  })
}

