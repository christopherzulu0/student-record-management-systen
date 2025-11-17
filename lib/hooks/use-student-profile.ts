"use client"

import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface StudentProfile {
  // Personal Information
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  nationality: string
  // Contact Information
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  // Academic Information
  studentId: string
  enrollmentDate: string
  program: string
  yearOfStudy: string
  expectedGraduation: string
  // Emergency Contact
  emergencyName: string
  emergencyRelation: string
  emergencyPhone: string
  emergencyEmail: string
  // Additional Information
  bio: string
}

async function fetchStudentProfile(): Promise<StudentProfile> {
  // Ensure we're on the client side
  if (typeof window === "undefined") {
    throw new Error("fetchStudentProfile can only be called on the client side")
  }

  // Use absolute URL for client-side fetching
  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/student/profile`, {
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
    throw new Error(errorData.error || "Failed to fetch student profile")
  }

  return response.json()
}

async function updateStudentProfile(data: Partial<StudentProfile>): Promise<{ message: string; success: boolean }> {
  // Ensure we're on the client side
  if (typeof window === "undefined") {
    throw new Error("updateStudentProfile can only be called on the client side")
  }

  // Use absolute URL for client-side fetching
  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/student/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to update student profile")
  }

  return response.json()
}

export function useStudentProfile() {
  return useSuspenseQuery({
    queryKey: ["student-profile"],
    queryFn: fetchStudentProfile,
  })
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateStudentProfile,
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ["student-profile"] })
      toast.success("Profile updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile")
    },
  })
}

