"use client"

import { ProtectedLayout } from "@/components/protected-layout"
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
  X,
  Download,
  Eye,
  Shield,
  FileCheck,
  FileX,
} from "lucide-react"
import { useState } from "react"

type DocumentStatus = "pending" | "uploaded" | "approved" | "rejected" | "expired"

interface Document {
  id: string
  name: string
  description: string
  required: boolean
  status: DocumentStatus
  uploadedDate?: string
  expiryDate?: string
  fileName?: string
  fileSize?: string
  rejectionReason?: string
}

const initialDocuments: Document[] = [
  {
    id: "1",
    name: "National ID (NRC)",
    description: "Copy of your National Registration Card",
    required: true,
    status: "uploaded",
    uploadedDate: "2024-01-15",
    fileName: "nrc_document.pdf",
    fileSize: "2.4 MB",
  },
  {
    id: "2",
    name: "Birth Certificate",
    description: "Certified copy of birth certificate",
    required: true,
    status: "approved",
    uploadedDate: "2024-01-10",
    fileName: "birth_certificate.pdf",
    fileSize: "1.8 MB",
  },
  {
    id: "3",
    name: "Academic Transcripts",
    description: "Official transcripts from previous institutions",
    required: true,
    status: "pending",
  },
  {
    id: "4",
    name: "Passport Photo",
    description: "Recent passport-sized photograph",
    required: true,
    status: "uploaded",
    uploadedDate: "2024-02-01",
    fileName: "passport_photo.jpg",
    fileSize: "456 KB",
  },
  {
    id: "5",
    name: "Medical Certificate",
    description: "Medical clearance certificate",
    required: true,
    status: "rejected",
    uploadedDate: "2024-01-20",
    fileName: "medical_cert.pdf",
    fileSize: "1.2 MB",
    rejectionReason: "Certificate expired. Please upload a recent one.",
  },
  {
    id: "6",
    name: "Guardian/Parent Consent Form",
    description: "Signed consent form from parent/guardian (if applicable)",
    required: false,
    status: "pending",
  },
  {
    id: "7",
    name: "Scholarship Documentation",
    description: "Proof of scholarship or financial aid",
    required: false,
    status: "pending",
  },
  {
    id: "8",
    name: "Visa/Residence Permit",
    description: "Valid visa or residence permit (for international students)",
    required: false,
    status: "pending",
  },
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [uploading, setUploading] = useState<string | null>(null)

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

  const handleFileUpload = (documentId: string, file: File) => {
    setUploading(documentId)
    // Simulate file upload
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                status: "uploaded",
                uploadedDate: new Date().toISOString().split("T")[0],
                fileName: file.name,
                fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              }
            : doc,
        ),
      )
      setUploading(null)
    }, 2000)
  }

  const handleFileInput = (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(documentId, file)
    }
  }

  const requiredDocs = documents.filter((doc) => doc.required)
  const completedDocs = requiredDocs.filter((doc) => doc.status === "approved").length
  const completionPercentage = requiredDocs.length > 0 ? Math.round((completedDocs / requiredDocs.length) * 100) : 0

  return (
    <ProtectedLayout allowedRoles={["student"]}>
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
                            <p className="text-sm text-muted-foreground mb-2">{document.description}</p>
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
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {document.status === "approved" && document.fileName && (
                            <>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </>
                          )}
                          {document.status !== "approved" && (
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileInput(document.id, e)}
                                disabled={uploading === document.id}
                              />
                              <Button
                                variant={document.status === "pending" ? "default" : "outline"}
                                size="sm"
                                disabled={uploading === document.id}
                              >
                                {uploading === document.id ? (
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
                            </label>
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
                            <p className="text-sm text-muted-foreground mb-2">{document.description}</p>
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
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {document.status === "approved" && document.fileName && (
                            <>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </>
                          )}
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileInput(document.id, e)}
                              disabled={uploading === document.id}
                            />
                            <Button
                              variant={document.status === "pending" ? "default" : "outline"}
                              size="sm"
                              disabled={uploading === document.id}
                            >
                              {uploading === document.id ? (
                                <>
                                  <Upload className="w-4 h-4 mr-2 animate-pulse" />
                                  Uploading...
                                </>
                              ) : document.status === "uploaded" || document.status === "approved" ? (
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
                          </label>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
