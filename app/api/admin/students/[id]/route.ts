import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Get student details by studentModelId
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get authenticated user from Clerk session
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized - No user in session' },
        { status: 401 }
      )
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { role: true },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Fetch student by studentModelId
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
          },
        },
        grades: {
          include: {
            course: {
              select: {
                courseCode: true,
                name: true,
                credits: true,
              },
            },
            semester: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Format response
    return NextResponse.json({
      student: {
        id: student.studentId,
        studentModelId: student.id,
        name: `${student.user.firstName} ${student.user.lastName || ''}`.trim() || student.user.email,
        email: student.user.email,
        phone: student.user.phone,
        dateOfBirth: student.user.dateOfBirth,
        gender: student.user.gender,
        address: student.user.address,
        city: student.user.city,
        state: student.user.state,
        zipCode: student.user.zipCode,
        country: student.user.country,
        gpa: student.cumulativeGPA || 0,
        credits: student.totalCreditsEarned || 0,
        status: student.status,
        program: student.program,
        department: student.department,
        yearOfStudy: student.yearOfStudy,
        enrollmentDate: student.enrollmentDate,
        expectedGraduation: student.expectedGraduation,
        grades: student.grades
          .filter((grade) => grade.course && grade.semester) // Filter out grades with missing relations
          .map((grade) => ({
            id: grade.id,
            courseCode: grade.course?.courseCode || 'N/A',
            courseName: grade.course?.name || 'Unknown Course',
            credits: grade.course?.credits || 0,
            semester: grade.semester?.name || 'Unknown Semester',
            score: grade.score,
            letterGrade: grade.letterGrade,
            attendance: grade.attendance,
            createdAt: grade.createdAt,
          })),
      },
    })
  } catch (error) {
    console.error('[API] Error fetching student details:', error)
    console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

// PUT - Update student information
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Get authenticated user from Clerk session
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized - No user in session' },
        { status: 401 }
      )
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { role: true },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Find student by studentModelId
    const student = await prisma.student.findUnique({
      where: { id },
      select: { id: true, userId: true },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Map status string to enum
    const statusMap: Record<string, 'active' | 'at_risk' | 'suspended' | 'inactive'> = {
      'active': 'active',
      'at-risk': 'at_risk',
      'suspended': 'suspended',
      'inactive': 'inactive',
    }

    // Prepare update data
    const studentUpdateData: any = {}

    if (body.status !== undefined) {
      studentUpdateData.status = statusMap[body.status] || 'active'
    }

    if (body.gpa !== undefined && body.gpa !== null) {
      studentUpdateData.cumulativeGPA = parseFloat(body.gpa)
    }

    if (body.credits !== undefined && body.credits !== null) {
      studentUpdateData.totalCreditsEarned = parseInt(body.credits, 10)
    }

    if (body.program !== undefined) {
      studentUpdateData.program = body.program || null
    }

    if (body.department !== undefined) {
      studentUpdateData.department = body.department || null
    }

    if (body.yearOfStudy !== undefined && body.yearOfStudy !== null) {
      studentUpdateData.yearOfStudy = parseInt(body.yearOfStudy, 10)
    }

    // Update student
    await prisma.student.update({
      where: { id },
      data: studentUpdateData,
    })

    return NextResponse.json({
      message: 'Student updated successfully',
      success: true,
    })
  } catch (error) {
    console.error('[API] Error updating student:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get authenticated user from Clerk session
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized - No user in session' },
        { status: 401 }
      )
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { role: true },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Find student by studentModelId
    const student = await prisma.student.findUnique({
      where: { id },
      select: { id: true, userId: true, studentId: true },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Delete student (this will cascade delete related records due to onDelete: Cascade)
    // The user will also be deleted if it's only linked to this student
    await prisma.student.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Student deleted successfully',
      success: true,
    })
  } catch (error) {
    console.error('[API] Error deleting student:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

