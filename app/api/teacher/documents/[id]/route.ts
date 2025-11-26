import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - Please login first" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, role: true },
    })

    if (!dbUser || dbUser.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden - Teacher access required" }, { status: 403 })
    }

    const { id } = await Promise.resolve(params)
    const body = await request.json()
    const { status, rejectionReason } = body

    if (!status || !["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'approved', 'rejected', or 'pending'" },
        { status: 400 }
      )
    }

    // If rejecting, require a rejection reason
    if (status === "rejected" && !rejectionReason) {
      return NextResponse.json(
        { error: "Rejection reason is required when rejecting a document" },
        { status: 400 }
      )
    }

    // Check if document exists
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Update document status
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === "rejected" ? rejectionReason : status === "pending" ? null : document.rejectionReason,
        reviewedBy: dbUser.id,
        reviewedAt: new Date(),
        // If resubmitting (status = pending), clear uploaded date and file info
        ...(status === "pending" && {
          uploadedDate: null,
          fileUrl: null,
          fileName: null,
          fileSize: null,
        }),
      },
    })

    return NextResponse.json({
      id: updatedDocument.id,
      name: updatedDocument.name,
      description: updatedDocument.description,
      required: updatedDocument.required,
      status: updatedDocument.status,
      uploadedDate: updatedDocument.uploadedDate?.toISOString(),
      expiryDate: updatedDocument.expiryDate?.toISOString(),
      fileName: updatedDocument.fileName,
      fileSize: updatedDocument.fileSize,
      fileUrl: updatedDocument.fileUrl,
      rejectionReason: updatedDocument.rejectionReason,
      reviewedBy: updatedDocument.reviewedBy,
      reviewedAt: updatedDocument.reviewedAt?.toISOString(),
      createdAt: updatedDocument.createdAt.toISOString(),
      updatedAt: updatedDocument.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("[API] Error updating document status:", error)
    return NextResponse.json(
      { error: "Failed to update document status" },
      { status: 500 }
    )
  }
}

