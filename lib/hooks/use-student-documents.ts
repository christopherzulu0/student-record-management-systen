import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export type DocumentStatus = "pending" | "uploaded" | "approved" | "rejected" | "expired"

export interface StudentDocument {
  id: string
  name: string
  description: string | null
  required: boolean
  status: DocumentStatus
  uploadedDate?: string
  expiryDate?: string
  fileName?: string | null
  fileSize?: string | null
  fileUrl?: string | null
  rejectionReason?: string | null
  createdAt: string
  updatedAt: string
}

async function fetchStudentDocuments(): Promise<StudentDocument[]> {
  const response = await fetch("/api/student/documents")
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    if (response.status === 403) {
      throw new Error("Forbidden - Student access required")
    }
    if (response.status === 404) {
      throw new Error("Student record not found")
    }
    throw new Error(errorData.error || "Failed to fetch documents")
  }

  return response.json()
}

export function useStudentDocuments() {
  return useSuspenseQuery({
    queryKey: ["student-documents"],
    queryFn: fetchStudentDocuments,
  })
}

interface SaveDocumentData {
  documentId: string
  fileUrl: string
  fileName: string
  fileSize?: string
  name?: string
  description?: string
  required?: boolean
}

async function saveDocument(data: SaveDocumentData): Promise<StudentDocument> {
  const response = await fetch("/api/student/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login first")
    }
    if (response.status === 403) {
      throw new Error("Forbidden - Student access required")
    }
    if (response.status === 404) {
      throw new Error("Student record not found")
    }
    throw new Error(errorData.error || "Failed to save document")
  }

  return response.json()
}

export function useSaveDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-documents"] })
      toast.success("Document uploaded successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload document")
    },
  })
}

