"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface RateTeacherData {
  teacherId: string
  rating: number
  comment?: string
}

export interface RateTeacherResponse {
  success: boolean
  rating: number
  averageRating: number
}

export interface TeacherRatingResponse {
  rating: number | null
  comment: string | null
}

async function rateTeacher(data: RateTeacherData): Promise<RateTeacherResponse> {
  if (typeof window === "undefined") {
    throw new Error("rateTeacher can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/student/teachers/${data.teacherId}/rate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      rating: data.rating,
      comment: data.comment,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    if (response.status === 403) {
      throw new Error(errorData.error || "Forbidden - Student access required")
    }
    if (response.status === 400) {
      throw new Error(errorData.error || "Invalid rating value")
    }
    throw new Error(errorData.error || "Failed to submit rating")
  }

  return response.json()
}

async function fetchTeacherRating(teacherId: string): Promise<TeacherRatingResponse> {
  if (typeof window === "undefined") {
    throw new Error("fetchTeacherRating can only be called on the client side")
  }

  const baseUrl = window.location.origin
  const response = await fetch(`${baseUrl}/api/student/teachers/${teacherId}/rate`, {
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
    throw new Error(errorData.error || "Failed to fetch rating")
  }

  return response.json()
}

export function useRateTeacher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: rateTeacher,
    onSuccess: (data, variables) => {
      // Invalidate teacher rating query
      queryClient.invalidateQueries({ queryKey: ["teacher-rating", variables.teacherId] })
      // Invalidate teachers list to update average ratings
      queryClient.invalidateQueries({ queryKey: ["student-teachers"] })
      
      toast.success(`Rating submitted successfully! Average: ${data.averageRating.toFixed(1)}`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit rating")
    },
  })
}

export function useTeacherRating(teacherId: string) {
  return useQuery({
    queryKey: ["teacher-rating", teacherId],
    queryFn: () => fetchTeacherRating(teacherId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

