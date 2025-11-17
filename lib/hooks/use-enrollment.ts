"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface EnrollmentData {
  courses: Array<{
    id: string
    courseCode: string
    name: string
    credits: number
  }>
  students: Array<{
    id: string
    studentId: string
    name: string
    email: string
  }>
  semesters: Array<{
    id: string
    name: string
    startDate: string
    endDate: string
    isActive: boolean
  }>
}

export interface EnrollStudentData {
  studentId: string
  courseId: string
  semesterId: string
}

async function fetchEnrollmentData(): Promise<EnrollmentData> {
  if (typeof window === "undefined") {
    throw new Error("fetchEnrollmentData can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/teacher/students/enrollment-data`, {
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
    throw new Error(errorData.error || "Failed to fetch enrollment data")
  }

  return response.json()
}

async function enrollStudent(data: EnrollStudentData): Promise<{ message: string; enrollment: any }> {
  if (typeof window === "undefined") {
    throw new Error("enrollStudent can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/teacher/students/enroll`, {
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
    if (response.status === 409) {
      throw new Error(errorData.error || "Student is already enrolled")
    }
    throw new Error(errorData.error || "Failed to enroll student")
  }

  return response.json()
}

export function useEnrollmentData() {
  return useQuery({
    queryKey: ["enrollment-data"],
    queryFn: fetchEnrollmentData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useEnrollStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: enrollStudent,
    onSuccess: () => {
      // Invalidate and refetch teacher students list
      queryClient.invalidateQueries({ queryKey: ["teacher-students"] })
      queryClient.invalidateQueries({ queryKey: ["teacher-stats"] })
    },
  })
}

