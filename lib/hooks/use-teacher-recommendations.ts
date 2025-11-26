"use client"

import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface TeacherRecommendation {
    id: string
    studentName: string
    studentId: string
    studentEmail: string
    courseCode: string
    courseName?: string
    purpose: string
    dateRequested: string
    deadline?: string
    daysLeft: number
    status: "pending" | "submitted" | "declined"
    priority: "high" | "medium" | "low"
    letterText?: string
    fileUrl?: string
    fileName?: string
    submittedAt?: string
    createdAt: string
}

async function fetchTeacherRecommendations(): Promise<TeacherRecommendation[]> {
    // Ensure we're on the client side
    if (typeof window === "undefined") {
        throw new Error("fetchTeacherRecommendations can only be called on the client side")
    }

    // Use absolute URL for client-side fetching
    const baseUrl = window.location.origin
    const response = await fetch(`${baseUrl}/api/teacher/recommendations`, {
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
        throw new Error(errorData.error || "Failed to fetch recommendations")
    }

    return response.json()
}

async function submitRecommendation(data: {
    id: string
    letterText?: string
    fileUrl?: string
    fileName?: string
}): Promise<{ success: boolean; message: string }> {
    // Ensure we're on the client side
    if (typeof window === "undefined") {
        throw new Error("submitRecommendation can only be called on the client side")
    }

    // Use absolute URL for client-side fetching
    const baseUrl = window.location.origin
    const response = await fetch(`${baseUrl}/api/teacher/recommendations/${data.id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            letterText: data.letterText,
            fileUrl: data.fileUrl,
            fileName: data.fileName
        }),
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit recommendation")
    }

    return response.json()
}

export function useTeacherRecommendations() {
    return useSuspenseQuery({
        queryKey: ["teacher-recommendations"],
        queryFn: fetchTeacherRecommendations,
    })
}

export function useSubmitRecommendation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: submitRecommendation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teacher-recommendations"] })
            toast.success("Recommendation letter submitted successfully")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to submit recommendation")
        },
    })
}
