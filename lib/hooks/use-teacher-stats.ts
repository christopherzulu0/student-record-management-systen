"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

export interface ClassData {
  name: string
  students: number
  avgGrade: number
  attendance: number
  trend: string
}

export interface GradeDistribution {
  range: string
  count: number
  fill: string
}

export interface PerformanceTrend {
  week: string
  avg: number
  submissions: number
}

export interface RecentGrade {
  student: string
  course: string
  grade: number
  date: string
  status: string
}

export interface AtRiskStudent {
  name: string
  course: string
  grade: number
  status: string
  trend: string
}

export interface PendingLetter {
  id: string
  student: string
  requestDate: string
  purpose: string
  priority: string
  days: number | null
}

export interface ClassMetric {
  label: string
  value: number | string
  change: string
}

export interface TeacherStats {
  totalStudents: number
  activeCourses: number
  classAverage: number
  pendingLettersCount: number
  atRisk: number
  classData: ClassData[]
  gradeDistribution: GradeDistribution[]
  performanceTrend: PerformanceTrend[]
  recentGrades: RecentGrade[]
  atRiskStudents: AtRiskStudent[]
  pendingLetters: PendingLetter[]
  classMetrics: ClassMetric[]
}

async function fetchTeacherStats(): Promise<TeacherStats> {
  if (typeof window === "undefined") {
    throw new Error("fetchTeacherStats can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/teacher/stats`, {
    credentials: "include",
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
    throw new Error(errorData.error || "Failed to fetch teacher stats")
  }

  return response.json()
}

export function useTeacherStats() {
  return useSuspenseQuery({
    queryKey: ["teacher-stats"],
    queryFn: fetchTeacherStats,
    staleTime: 60 * 1000, // 1 minute
  })
}

