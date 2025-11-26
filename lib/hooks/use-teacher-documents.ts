"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export type DocumentStatus = "pending" | "uploaded" | "approved" | "rejected" | "expired"

export interface UpdateDocumentStatusData {
  documentId: string
  status: "approved" | "rejected" | "pending"
  rejectionReason?: string
}

async function updateDocumentStatus(data: UpdateDocumentStatusData): Promise<void> {
  const response = await fetch(`/api/teacher/documents/${data.documentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: data.status,
      rejectionReason: data.rejectionReason,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    if (response.status === 403) {
      throw new Error("Forbidden - Teacher access required")
    }
    if (response.status === 404) {
      throw new Error("Document not found")
    }
    throw new Error(errorData.error || "Failed to update document status")
  }
}

export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateDocumentStatus,
    onSuccess: async (_, variables) => {
      // Invalidate and refetch teacher students query to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["teacher-students"] })
      await queryClient.refetchQueries({ queryKey: ["teacher-students"] })
      
      const statusMessages = {
        approved: "Document approved successfully",
        rejected: "Document rejected",
        pending: "Document marked for resubmission",
      }
      
      toast.success(statusMessages[variables.status] || "Document status updated")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update document status")
    },
  })
}

