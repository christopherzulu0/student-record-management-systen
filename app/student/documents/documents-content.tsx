"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Eye,
  Shield,
  FileCheck,
  FileX,
} from "lucide-react"
import { useRef, useState } from "react"
import { useStudentDocuments, useSaveDocument, type StudentDocument, type DocumentStatus } from "@/lib/hooks/use-student-documents"
import { useUploadThing } from "@/lib/uploadthing"
import { toast } from "sonner"

export function DocumentsContent() {
  const { data: documents } = useStudentDocuments()
  const saveDocumentMutation = useSaveDocument()
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [uploadingDocumentId, setUploadingDocumentId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const uploadingDocumentIdRef = useRef<string | null>(null)

  // Keep ref in sync with state
  uploadingDocumentIdRef.current = uploadingDocumentId

  const { startUpload, isUploading: isUploadThingUploading } = useUploadThing("studentDocument", {
    onUploadBegin: () => {
      console.log("[Upload] Upload began")
    },
    onClientUploadComplete: (res) => {
      const currentDocumentId = uploadingDocumentIdRef.current
      console.log("[Upload] Client upload complete:", res, "Document ID:", currentDocumentId)
      
      if (res && res[0] && currentDocumentId) {
        const file = res[0]
        const document = documents.find((d) => d.id === currentDocumentId)
        
        if (document) {
          console.log("[Upload] Saving document metadata for:", currentDocumentId)
          saveDocumentMutation.mutate({
            documentId: currentDocumentId,
            fileUrl: file.url,
            fileName: file.name,
            fileSize: file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : undefined,
            name: document.name,
            description: document.description || undefined,
            required: document.required,
          })
        } else {
          console.error("[Upload] Document not found for ID:", currentDocumentId)
        }
        
        setUploadingDocumentId(null)
        uploadingDocumentIdRef.current = null
        setUploadProgress((prev) => {
          const next = { ...prev }
          delete next[currentDocumentId]
          return next
        })
        toast.success("File uploaded successfully")
      } else {
        console.error("[Upload] Missing data:", { res, currentDocumentId })
        setUploadingDocumentId(null)
        uploadingDocumentIdRef.current = null
        toast.error("Upload completed but no file URL received")
      }
    },
    onUploadError: (error: Error) => {
      console.error("[Upload] Upload error:", error)
      const currentDocumentId = uploadingDocumentIdRef.current
      setUploadingDocumentId(null)
      uploadingDocumentIdRef.current = null
      setUploadProgress((prev) => {
        const next = { ...prev }
        if (currentDocumentId) delete next[currentDocumentId]
        return next
      })
      toast.error(`Upload failed: ${error.message}`)
    },
    onUploadProgress: (progress) => {
      const currentDocumentId = uploadingDocumentIdRef.current
      if (currentDocumentId) {
        console.log("[Upload] Progress:", progress, "% for document:", currentDocumentId)
        setUploadProgress((prev) => ({
          ...prev,
          [currentDocumentId]: progress,
        }))
      }
    },
  })

  const handleFileInput = async (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PDF, JPG, or PNG files only.")
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB limit. Please upload a smaller file.")
      return
    }

    console.log("[Upload] Starting upload for document:", documentId)
    setUploadingDocumentId(documentId)
    uploadingDocumentIdRef.current = documentId
    setUploadProgress((prev) => ({ ...prev, [documentId]: 0 }))

    try {
      console.log("[Upload] Calling startUpload with file:", file.name, "Type:", file.type, "Size:", file.size)
      await startUpload([file])
      console.log("[Upload] startUpload call completed")
    } catch (error) {
      console.error("[Upload] Error starting upload:", error)
      setUploadingDocumentId(null)
      uploadingDocumentIdRef.current = null
      setUploadProgress((prev) => {
        const next = { ...prev }
        delete next[documentId]
        return next
      })
      toast.error(`Failed to start upload: ${error instanceof Error ? error.message : "Unknown error"}`)
    }

    // Reset input
    if (fileInputRefs.current[documentId]) {
      fileInputRefs.current[documentId]!.value = ""
    }
  }

  const handleDownload = (fileUrl: string, fileName?: string | null) => {
    if (!fileUrl) return
    
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName || "document"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleView = (fileUrl: string) => {
    if (!fileUrl) return
    window.open(fileUrl, "_blank")
  }

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "uploaded":
        return <Clock className="w-5 h-5 text-blue-600" />
      case "rejected":
        return <FileX className="w-5 h-5 text-red-600" />
      case "expired":
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: DocumentStatus) => {
    const variants: Record<DocumentStatus, { className: string; label: string }> = {
      approved: {
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        label: "Approved",
      },
      uploaded: {
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        label: "Under Review",
      },
      rejected: {
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
        label: "Rejected",
      },
      expired: {
        className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
        label: "Expired",
      },
      pending: {
        className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
        label: "Pending",
      },
    }
    return variants[status]
  }

  const requiredDocs = documents.filter((doc) => doc.required)
  const completedDocs = requiredDocs.filter((doc) => doc.status === "approved").length
  const completionPercentage = requiredDocs.length > 0 ? Math.round((completedDocs / requiredDocs.length) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Document Uploads
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage your required documents and certificates
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Required Documents</CardTitle>
              <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {completedDocs}/{requiredDocs.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/20 dark:to-background">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{completionPercentage}%</div>
            <Progress value={completionPercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-background">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {documents.filter((doc) => doc.status === "uploaded").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Under review</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Notice */}
      <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/20 dark:to-background">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-green-900 dark:text-green-100">Secure Document Storage</p>
              <p className="text-sm text-muted-foreground mt-1">
                All uploaded documents are encrypted with AES-256 encryption and stored securely. Your documents are
                only accessible to authorized personnel.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Required Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>These documents are mandatory for enrollment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents
              .filter((doc) => doc.required)
              .map((document) => {
                const statusBadge = getStatusBadge(document.status)
                const isUploading = uploadingDocumentId === document.id
                const progress = uploadProgress[document.id] || 0
                return (
                  <div
                    key={document.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 bg-muted rounded-lg">{getStatusIcon(document.status)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{document.name}</h3>
                            <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                          </div>
                          {document.description && (
                            <p className="text-sm text-muted-foreground mb-2">{document.description}</p>
                          )}
                          {document.uploadedDate && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Uploaded: {new Date(document.uploadedDate).toLocaleDateString()}</span>
                              {document.fileName && (
                                <>
                                  <span>•</span>
                                  <span>{document.fileName}</span>
                                  {document.fileSize && (
                                    <>
                                      <span>•</span>
                                      <span>{document.fileSize}</span>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                          {document.rejectionReason && (
                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 rounded text-sm text-red-700 dark:text-red-300">
                              <strong>Rejection reason:</strong> {document.rejectionReason}
                            </div>
                          )}
                          {isUploading && (
                            <div className="mt-2">
                              <Progress value={progress} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">Uploading... {progress}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {document.status === "approved" && document.fileUrl && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(document.fileUrl!)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(document.fileUrl!, document.fileName)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </>
                        )}
                        {document.status !== "approved" && document.status !== "uploaded" && (
                          <>
                            <input
                              ref={(el) => (fileInputRefs.current[document.id] = el)}
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileInput(document.id, e)}
                              disabled={isUploading || isUploadThingUploading}
                              id={`file-input-${document.id}`}
                            />
                            <Button
                              variant={document.status === "pending" ? "default" : "outline"}
                              size="sm"
                              disabled={isUploading || isUploadThingUploading}
                              onClick={() => {
                                const input = fileInputRefs.current[document.id]
                                if (input) {
                                  input.click()
                                }
                              }}
                            >
                              {isUploading ? (
                                <>
                                  <Upload className="w-4 h-4 mr-2 animate-pulse" />
                                  Uploading...
                                </>
                              ) : document.status === "rejected" || document.status === "expired" ? (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Re-upload
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload
                                </>
                              )}
                            </Button>
                          </>
                        )}
                        {document.status === "uploaded" && (
                          <div className="text-xs text-muted-foreground">
                            Under review - cannot upload until reviewed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Optional Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Optional Documents</CardTitle>
          <CardDescription>Additional documents you may want to provide</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents
              .filter((doc) => !doc.required)
              .map((document) => {
                const statusBadge = getStatusBadge(document.status)
                const isUploading = uploadingDocumentId === document.id
                const progress = uploadProgress[document.id] || 0
                return (
                  <div
                    key={document.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 bg-muted rounded-lg">{getStatusIcon(document.status)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{document.name}</h3>
                            {document.status !== "pending" && (
                              <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                            )}
                          </div>
                          {document.description && (
                            <p className="text-sm text-muted-foreground mb-2">{document.description}</p>
                          )}
                          {document.uploadedDate && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Uploaded: {new Date(document.uploadedDate).toLocaleDateString()}</span>
                              {document.fileName && (
                                <>
                                  <span>•</span>
                                  <span>{document.fileName}</span>
                                  {document.fileSize && (
                                    <>
                                      <span>•</span>
                                      <span>{document.fileSize}</span>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                          {isUploading && (
                            <div className="mt-2">
                              <Progress value={progress} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">Uploading... {progress}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {document.status === "approved" && document.fileUrl && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(document.fileUrl!)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(document.fileUrl!, document.fileName)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </>
                        )}
                        {document.status !== "uploaded" && (
                          <>
                            <input
                              ref={(el) => (fileInputRefs.current[document.id] = el)}
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileInput(document.id, e)}
                              disabled={isUploading || isUploadThingUploading}
                              id={`file-input-optional-${document.id}`}
                            />
                            <Button
                              variant={document.status === "pending" ? "default" : "outline"}
                              size="sm"
                              disabled={isUploading || isUploadThingUploading}
                              onClick={() => {
                                const input = fileInputRefs.current[document.id]
                                if (input) {
                                  input.click()
                                }
                              }}
                            >
                              {isUploading ? (
                                <>
                                  <Upload className="w-4 h-4 mr-2 animate-pulse" />
                                  Uploading...
                                </>
                              ) : document.status === "approved" ? (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Replace
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload
                                </>
                              )}
                            </Button>
                          </>
                        )}
                        {document.status === "uploaded" && (
                          <div className="text-xs text-muted-foreground">
                            Under review - cannot upload until reviewed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

