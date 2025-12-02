"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

export interface TeacherCourse {
  id: string
  courseCode: string
  name: string
  department: string | null
}

export interface StudentTeacher {
  id: string
  teacherId: string | null
  userId: string
  name: string
  email: string
  phone: string
  firstName: string
  lastName: string | null
  department: string | null
  course: string
  office: string
  officeHours: string
  rating: number | null
  bio: string
  courses: TeacherCourse[]
}

async function fetchStudentTeachers(): Promise<StudentTeacher[]> {
  if (typeof window === "undefined") {
    throw new Error("fetchStudentTeachers can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/student/teachers`, {
    credentials: "include",
  })

  if (!response.ok) {
    const errorData = await response.json()
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    if (response.status === 403) {
      throw new Error("Forbidden - Student access required")
    }
    throw new Error(errorData.error || "Failed to fetch teachers")
  }

  return response.json()
}

export function useStudentTeachers() {
  return useSuspenseQuery({
    queryKey: ["student-teachers"],
    queryFn: fetchStudentTeachers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

