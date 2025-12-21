"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

export interface Parent {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  relationship: string | null
}

export interface Child {
  id: string
  studentId: string
  firstName: string
  lastName: string
  program: string | null
  yearOfStudy: number | null
  cumulativeGPA: number
  semesterGPA: number
  totalCreditsEarned: number
  totalCreditsRequired: number
  status: string
  expectedGraduation: string | null
  enrollments: Array<{
    courseCode: string
    courseName: string
    credits: number
    status: string
  }>
  grades: Array<{
    courseCode: string
    courseName: string
    score: number
    letterGrade: string
    attendance: number | null
    trend: string
    assignments: number
    completed: number
  }>
  documents: Array<{
    name: string
    status: string
    required: boolean
    expiryDate: string | null
  }>
  gpaHistory: Array<{
    semester: string
    gpa: number
  }>
  relationship: string | null
  isPrimary: boolean
}

export interface ParentDashboardData {
  parent: Parent
  children: Child[]
}

async function fetchParentDashboard(): Promise<ParentDashboardData> {
  const url = typeof window !== "undefined" 
    ? `${window.location.origin}/api/parent/dashboard`
    : "/api/parent/dashboard"
  
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
      throw new Error("Forbidden - Parent access required")
    }
    if (response.status === 404) {
      throw new Error("Parent record not found")
    }
    throw new Error(errorData.error || "Failed to fetch parent dashboard data")
  }

  return response.json()
}

export function useParentDashboard() {
  return useSuspenseQuery({
    queryKey: ["parent-dashboard"],
    queryFn: fetchParentDashboard,
    staleTime: 60 * 1000, // 1 minute
  })
}

