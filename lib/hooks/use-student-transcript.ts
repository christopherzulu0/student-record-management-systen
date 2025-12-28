"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

export interface TranscriptCourse {
  code: string
  name: string
  credits: number
  grade: string
  score: number
}

export interface TranscriptSemester {
  semester: string
  average: number
  courses: TranscriptCourse[]
}

export interface StudentTranscriptResponse {
  studentName: string
  studentId: string
  email: string
  enrollmentDate: string
  average: number
  totalCreditsEarned: number
  totalCreditsRequired: number
  academicStanding: string
  semesters: TranscriptSemester[]
}

async function fetchStudentTranscript(): Promise<StudentTranscriptResponse> {
  // Ensure we're on the client side
  if (typeof window === "undefined") {
    throw new Error("fetchStudentTranscript can only be called on the client side")
  }

  // Use absolute URL for client-side fetching
  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/student/transcript`, {
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
    throw new Error(errorData.error || "Failed to fetch student transcript")
  }

  return response.json()
}

export function useStudentTranscript() {
  return useSuspenseQuery({
    queryKey: ["student-transcript"],
    queryFn: fetchStudentTranscript,
  })
}

