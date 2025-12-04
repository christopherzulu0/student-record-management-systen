import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import {prisma} from "@/lib/prisma"

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - Please login first" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, role: true },
    })

    if (!dbUser || dbUser.role !== "student") {
      return NextResponse.json({ error: "Forbidden - Student access required" }, { status: 403 })
    }

    // Get student record
    const student = await prisma.student.findUnique({
      where: { userId: dbUser.id },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json({ error: "Student record not found" }, { status: 404 })
    }

    // Fetch all documents for this student
    let documents = await prisma.document.findMany({
      where: { studentId: student.id },
      orderBy: [
        { required: "desc" },
        { createdAt: "desc" },
      ],
    })

    // If no documents exist, create default document templates
    if (documents.length === 0) {
      const defaultDocuments = [
        {
          name: "National ID (NRC)",
          description: "Copy of your National Registration Card",
          required: true,
        },
        {
          name: "Birth Certificate",
          description: "Certified copy of birth certificate",
          required: true,
        },
        {
          name: "Academic Transcripts",
          description: "Official transcripts from previous institutions",
          required: true,
        },
        {
          name: "Passport Photo",
          description: "Recent passport-sized photograph",
          required: true,
        },
        {
          name: "Medical Certificate",
          description: "Medical clearance certificate",
          required: true,
        },
        {
          name: "Guardian/Parent Consent Form",
          description: "Signed consent form from parent/guardian (if applicable)",
          required: false,
        },
        {
          name: "Scholarship Documentation",
          description: "Proof of scholarship or financial aid",
          required: false,
        },
        {
          name: "Visa/Residence Permit",
          description: "Valid visa or residence permit (for international students)",
          required: false,
        },
      ]

      // Create all default documents in a transaction
      await prisma.$transaction(
        defaultDocuments.map((doc) =>
          prisma.document.create({
            data: {
              studentId: student.id,
              name: doc.name,
              description: doc.description,
              required: doc.required,
              status: "pending",
            },
          })
        )
      )

      // Fetch the newly created documents
      documents = await prisma.document.findMany({
        where: { studentId: student.id },
        orderBy: [
          { required: "desc" },
          { createdAt: "desc" },
        ],
      })
    }

    // Format documents for response
    const formattedDocuments = documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      description: doc.description,
      required: doc.required,
      status: doc.status,
      uploadedDate: doc.uploadedDate?.toISOString(),
      expiryDate: doc.expiryDate?.toISOString(),
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      fileUrl: doc.fileUrl,
      rejectionReason: doc.rejectionReason,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    }))

    return NextResponse.json(formattedDocuments)
  } catch (error) {
    console.error("[API] Error fetching student documents:", error)
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - Please login first" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, role: true },
    })

    if (!dbUser || dbUser.role !== "student") {
      return NextResponse.json({ error: "Forbidden - Student access required" }, { status: 403 })
    }

    // Get student record
    const student = await prisma.student.findUnique({
      where: { userId: dbUser.id },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json({ error: "Student record not found" }, { status: 404 })
    }

    const body = await request.json()
    const { documentId, fileUrl, fileName, fileSize } = body

    if (!documentId || !fileUrl || !fileName) {
      return NextResponse.json(
        { error: "Missing required fields: documentId, fileUrl, fileName" },
        { status: 400 }
      )
    }

    // Check if document exists
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
    })

    // Update or create document
    const document = existingDocument
      ? await prisma.document.update({
          where: { id: documentId },
          data: {
            fileUrl,
            fileName,
            fileSize: fileSize || null,
            status: "uploaded",
            uploadedDate: new Date(),
          },
        })
      : await prisma.document.create({
          data: {
            id: documentId,
            studentId: student.id,
            name: body.name || "Document",
            description: body.description || null,
            required: body.required || false,
            fileUrl,
            fileName,
            fileSize: fileSize || null,
            status: "uploaded",
            uploadedDate: new Date(),
          },
        })

    return NextResponse.json({
      id: document.id,
      name: document.name,
      description: document.description,
      required: document.required,
      status: document.status,
      uploadedDate: document.uploadedDate?.toISOString(),
      expiryDate: document.expiryDate?.toISOString(),
      fileName: document.fileName,
      fileSize: document.fileSize,
      fileUrl: document.fileUrl,
      rejectionReason: document.rejectionReason,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("[API] Error creating/updating student document:", error)
    return NextResponse.json(
      { error: "Failed to save document" },
      { status: 500 }
    )
  }
}

