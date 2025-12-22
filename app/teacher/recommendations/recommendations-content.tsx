"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination"
import { CheckCircle, Clock, AlertCircle, FileText, Loader2, X, FileIcon, Upload } from "lucide-react"
import { useState, useMemo, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTeacherRecommendations, useSubmitRecommendation, type TeacherRecommendation } from "@/lib/hooks/use-teacher-recommendations"
import { cn } from "@/lib/utils"
import { useUploadThing } from "@/lib/uploadthing"
import { toast } from "sonner" // Assuming toast is from sonner, as it's a common pattern

export function RecommendationsContent() {
    const { data: recommendations } = useTeacherRecommendations()
    const submitMutation = useSubmitRecommendation()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [selectedRequest, setSelectedRequest] = useState<TeacherRecommendation | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [fileUrl, setFileUrl] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [activeTab, setActiveTab] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)

    const { startUpload, isUploading: isUploadThingUploading } = useUploadThing("recommendationLetter", {
        onClientUploadComplete: (res) => {
            console.log("[Upload] Client upload complete:", res);
            if (res && res[0]) {
                console.log("[Upload] File URL:", res[0].url);
                console.log("[Upload] File name:", res[0].name);
                setFileUrl(res[0].url)
                setFileName(res[0].name)
                setIsUploading(false)
                setUploadProgress(0)
                toast.success("File uploaded successfully")
            } else {
                console.error("[Upload] No file in response:", res);
                setIsUploading(false)
                setUploadProgress(0)
                toast.error("Upload completed but no file URL received")
            }
        },
        onUploadError: (error: Error) => {
            console.error("[Upload] Upload error:", error);
            setIsUploading(false)
            setUploadProgress(0)
            toast.error(`Upload failed: ${error.message}`)
        },
        onUploadProgress: (progress) => {
            console.log("[Upload] Upload progress:", progress);
            setUploadProgress(progress)
        },
    })

    const handleFileUpload = async (file: File) => {
        // Validate file type
        const validTypes = ['application/pdf', 'text/plain']
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a PDF or text file")
            return
        }

        // Validate file size (4MB)
        if (file.size > 4 * 1024 * 1024) {
            toast.error("File size must be less than 4MB")
            return
        }

        setIsUploading(true)
        setUploadProgress(0)
        toast.info("Uploading file...")

        try {
            await startUpload([file])
        } catch (error) {
            console.error("[Upload] Error starting upload:", error)
            setIsUploading(false)
            setUploadProgress(0)
            toast.error("Failed to start upload")
        } finally {
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        await handleFileUpload(file)
    }

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (!file) return
        await handleFileUpload(file)
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const handleSubmitLetter = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedRequest || !fileUrl) {
            toast.error("Please upload a recommendation letter")
            return
        }

        await submitMutation.mutateAsync({
            id: selectedRequest.id,
            fileUrl: fileUrl,
            fileName: fileName || undefined,
        })

        setIsDialogOpen(false)
        setFileUrl(null)
        setFileName(null)
        setSelectedRequest(null)
        setIsUploading(false)
        setUploadProgress(0)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        setCurrentPage(1)
    }

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value))
        setCurrentPage(1)
    }

    // Filter recommendations
    const pending = useMemo(() => recommendations.filter((r) => r.status === "pending"), [recommendations])
    const submitted = useMemo(() => recommendations.filter((r) => r.status === "submitted"), [recommendations])
    const urgent = useMemo(() => pending.filter((r) => r.daysLeft <= 7 && r.daysLeft > 0), [pending])

    // Pagination calculations for each tab
    const allRequestsData = recommendations
    const allTotalPages = Math.ceil(allRequestsData.length / itemsPerPage)
    const allStartIndex = (currentPage - 1) * itemsPerPage
    const allEndIndex = allStartIndex + itemsPerPage
    const paginatedAllRequests = allRequestsData.slice(allStartIndex, allEndIndex)

    const pendingTotalPages = Math.ceil(pending.length / itemsPerPage)
    const pendingStartIndex = (currentPage - 1) * itemsPerPage
    const pendingEndIndex = pendingStartIndex + itemsPerPage
    const paginatedPending = pending.slice(pendingStartIndex, pendingEndIndex)

    const urgentTotalPages = Math.ceil(urgent.length / itemsPerPage)
    const urgentStartIndex = (currentPage - 1) * itemsPerPage
    const urgentEndIndex = urgentStartIndex + itemsPerPage
    const paginatedUrgent = urgent.slice(urgentStartIndex, urgentEndIndex)

    const getStatusIcon = (status: string) => {
        if (status === "submitted") return <CheckCircle className="w-4 h-4 text-green-600" />
        return <Clock className="w-4 h-4 text-yellow-600" />
    }

    const getPriorityColor = (priority: string) => {
        if (priority === "high") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
        if (priority === "medium") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
    }

    const renderPagination = (totalPages: number, data: TeacherRecommendation[], startIndex: number, endIndex: number) => {
        if (data.length === 0 || totalPages <= 1) return null

        return (
            <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} results
                </div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (currentPage > 1) setCurrentPage(currentPage - 1)
                                }}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                                return (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setCurrentPage(page)
                                            }}
                                            isActive={currentPage === page}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                                return (
                                    <PaginationItem key={page}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )
                            }
                            return null
                        })}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                                }}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        )
    }

    const renderRecommendationDialog = (request: TeacherRecommendation) => (
        <Dialog
            open={isDialogOpen && selectedRequest?.id === request.id}
            onOpenChange={(open) => {
                if (!open) {
                    setSelectedRequest(null)
                    setFileUrl(null)
                    setFileName(null)
                    setIsUploading(false)
                    setUploadProgress(0)
                    if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                    }
                }
                setIsDialogOpen(open)
            }}
        >
            <DialogTrigger asChild>
                <Button
                    variant={request.status === "submitted" ? "outline" : "default"}
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                    disabled={request.status === "submitted"}
                >
                    {request.status === "submitted" ? "Submitted" : "Write"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Write Recommendation Letter
                    </DialogTitle>
                    <DialogDescription>
                        For: {selectedRequest?.studentName} ({selectedRequest?.studentId})
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitLetter} className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Course</p>
                                <p className="font-semibold">{selectedRequest?.courseCode}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Purpose</p>
                                <p className="font-semibold">{selectedRequest?.purpose}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Deadline</p>
                                <p className="font-semibold">
                                    {selectedRequest?.deadline ? new Date(selectedRequest.deadline).toLocaleDateString() : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Days Left</p>
                                <p className={cn(
                                    "font-semibold",
                                    selectedRequest && selectedRequest.daysLeft <= 3 ? "text-red-600" :
                                        selectedRequest && selectedRequest.daysLeft <= 7 ? "text-yellow-600" : ""
                                )}>
                                    {selectedRequest?.daysLeft && selectedRequest.daysLeft > 0 ? `${selectedRequest.daysLeft} days` : "Overdue"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Recommendation Letter (PDF)</label>

                        {!fileUrl ? (
                            <div
                                className="border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.txt"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isUploading || isUploadThingUploading}
                                />
                                <div
                                    onClick={() => !isUploading && !isUploadThingUploading && fileInputRef.current?.click()}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 py-8",
                                        isUploading || isUploadThingUploading ? "cursor-wait" : "cursor-pointer"
                                    )}
                                >
                                    {isUploading || isUploadThingUploading ? (
                                        <>
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                            <div className="text-center">
                                                <p className="text-sm font-medium">Uploading...</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {uploadProgress > 0 ? `${uploadProgress}%` : "Processing..."}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-muted-foreground" />
                                            <div className="text-center">
                                                <p className="text-sm font-medium">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    PDF or TXT (MAX. 4MB)
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-background rounded-full border">
                                        <FileIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{fileName}</p>
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline"
                                        >
                                            View uploaded file
                                        </a>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setFileUrl(null)
                                        setFileName(null)
                                        setIsUploading(false)
                                        setUploadProgress(0)
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = ''
                                        }
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={submitMutation.isPending || !fileUrl}
                        >
                            {submitMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Recommendation"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={submitMutation.isPending}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )

    return (
        <div className="p-6 space-y-6 pb-6">
            <div>
                <h1 className="text-3xl font-bold">Recommendation Letters</h1>
                <p className="text-muted-foreground mt-2">Manage and respond to student recommendation requests</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recommendations.length}</div>
                        <p className="text-xs text-muted-foreground">All requests</p>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200 dark:border-yellow-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pending.length}</div>
                        <p className="text-xs text-muted-foreground">To be completed</p>
                    </CardContent>
                </Card>

                <Card className="border-green-200 dark:border-green-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Submitted</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{submitted.length}</div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                    </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Urgent
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{urgent.length}</div>
                        <p className="text-xs text-muted-foreground">Due within 7 days</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">
                        All Requests
                        <Badge variant="outline" className="ml-2">
                            {recommendations.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                        Pending
                        <Badge variant="outline" className="ml-2">
                            {pending.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="urgent">
                        Urgent
                        <Badge variant="outline" className="ml-2">
                            {urgent.length}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>All Recommendation Requests</CardTitle>
                                    <CardDescription className="mt-1">
                                        {allRequestsData.length} requests • Showing {allStartIndex + 1}-{Math.min(allEndIndex, allRequestsData.length)} of {allRequestsData.length}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="items-per-page-all" className="text-sm text-muted-foreground">
                                            Per page:
                                        </Label>
                                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                            <SelectTrigger id="items-per-page-all" className="w-20 h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5</SelectItem>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="20">20</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted">
                                            <TableHead>Student</TableHead>
                                            <TableHead>Course</TableHead>
                                            <TableHead>Purpose</TableHead>
                                            <TableHead>Requested</TableHead>
                                            <TableHead>Deadline</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedAllRequests.length > 0 ? (
                                            paginatedAllRequests.map((request) => (
                                                <TableRow key={request.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium">
                                                        <div>
                                                            <p>{request.studentName}</p>
                                                            <p className="text-xs text-muted-foreground">{request.studentId}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{request.courseCode}</TableCell>
                                                    <TableCell className="max-w-xs truncate" title={request.purpose}>{request.purpose}</TableCell>
                                                    <TableCell className="text-sm">
                                                        {new Date(request.dateRequested).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            <span
                                                                className={
                                                                    request.daysLeft <= 7 && request.daysLeft > 0
                                                                        ? "font-semibold text-orange-600"
                                                                        : request.daysLeft <= 0
                                                                            ? "font-semibold text-green-600"
                                                                            : ""
                                                                }
                                                            >
                                                                {request.deadline ? new Date(request.deadline).toLocaleDateString() : "N/A"}
                                                            </span>
                                                            {request.daysLeft > 0 && (
                                                                <span className="text-xs text-muted-foreground">{request.daysLeft} days left</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getPriorityColor(request.priority)}>
                                                            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={request.status === "submitted" ? "default" : "outline"}>
                                                            {getStatusIcon(request.status)}
                                                            <span className="ml-1 capitalize">{request.status}</span>
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {renderRecommendationDialog(request)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                    No recommendation requests yet
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {renderPagination(allTotalPages, allRequestsData, allStartIndex, allEndIndex)}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Pending Requests</CardTitle>
                                    <CardDescription className="mt-1">
                                        {pending.length} requests • Showing {pendingStartIndex + 1}-{Math.min(pendingEndIndex, pending.length)} of {pending.length}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="items-per-page-pending" className="text-sm text-muted-foreground">
                                            Per page:
                                        </Label>
                                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                            <SelectTrigger id="items-per-page-pending" className="w-20 h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5</SelectItem>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="20">20</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted">
                                            <TableHead>Student</TableHead>
                                            <TableHead>Purpose</TableHead>
                                            <TableHead>Deadline</TableHead>
                                            <TableHead>Days Left</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedPending.length > 0 ? (
                                            paginatedPending.map((request) => (
                                                <TableRow key={request.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium">{request.studentName}</TableCell>
                                                    <TableCell className="max-w-xs truncate" title={request.purpose}>{request.purpose}</TableCell>
                                                    <TableCell>{request.deadline ? new Date(request.deadline).toLocaleDateString() : "N/A"}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                request.daysLeft <= 3
                                                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                                                    : request.daysLeft <= 7
                                                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                                                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                                            }
                                                        >
                                                            {request.daysLeft > 0 ? `${request.daysLeft} days` : "Overdue"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {renderRecommendationDialog(request)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                                    No pending requests
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {renderPagination(pendingTotalPages, pending, pendingStartIndex, pendingEndIndex)}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="urgent" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                        Urgent Requests
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        {urgent.length} requests • Showing {urgentStartIndex + 1}-{Math.min(urgentEndIndex, urgent.length)} of {urgent.length} • Due within 7 days
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="items-per-page-urgent" className="text-sm text-muted-foreground">
                                            Per page:
                                        </Label>
                                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                            <SelectTrigger id="items-per-page-urgent" className="w-20 h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5</SelectItem>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="20">20</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {paginatedUrgent.length > 0 ? (
                                <div className="space-y-3">
                                    {paginatedUrgent.map((request) => (
                                        <div
                                            key={request.id}
                                            className="flex items-start justify-between p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950 dark:border-red-800"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <p className="font-semibold">{request.studentName}</p>
                                                    <Badge className="bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100">URGENT</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{request.purpose}</p>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Due: {request.deadline ? new Date(request.deadline).toLocaleDateString() : "N/A"} ({request.daysLeft} days left)
                                                </p>
                                            </div>
                                            {renderRecommendationDialog(request)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                                    <p>No urgent requests right now!</p>
                                </div>
                            )}
                            {renderPagination(urgentTotalPages, urgent, urgentStartIndex, urgentEndIndex)}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800 mb-20">
                <CardHeader>
                    <CardTitle className="text-amber-900 dark:text-amber-100">Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-amber-900 dark:text-amber-100 text-sm">
                    <p>• Be professional and objective in your assessment</p>
                    <p>• Include specific examples of the student's performance and achievements</p>
                    <p>• Address the purpose of the recommendation directly</p>
                    <p>• Meet deadlines to ensure timely submission to the student</p>
                    <p>• Letters are confidential and not shared with students before submission</p>
                </CardContent>
            </Card>
        </div>
    )
}
