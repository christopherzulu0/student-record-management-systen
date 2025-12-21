import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// PUT - Update parent-student relationship
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized - No user in session' },
        { status: 401 }
      )
    }

    // Verify user is teacher
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { 
        id: true,
        role: true,
      },
    })

    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Forbidden - Teacher access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { relationship, isPrimary, canViewGrades, canViewAttendance, canViewDocuments } = body

    // Find parent-student relationship
    const parentStudent = await prisma.parentStudent.findUnique({
      where: { id },
      include: {
        student: { select: { id: true } },
      },
    })

    if (!parentStudent) {
      return NextResponse.json(
        { error: 'Parent-student relationship not found' },
        { status: 404 }
      )
    }

    // If setting as primary, unset other primary relationships for this student
    if (isPrimary === true) {
      await prisma.parentStudent.updateMany({
        where: {
          studentId: parentStudent.studentId,
          isPrimary: true,
          id: { not: id },
        },
        data: {
          isPrimary: false,
        },
      })
    }

    // Update relationship
    const updated = await prisma.parentStudent.update({
      where: { id },
      data: {
        relationship: relationship !== undefined ? relationship : undefined,
        isPrimary: isPrimary !== undefined ? isPrimary : undefined,
        canViewGrades: canViewGrades !== undefined ? canViewGrades : undefined,
        canViewAttendance: canViewAttendance !== undefined ? canViewAttendance : undefined,
        canViewDocuments: canViewDocuments !== undefined ? canViewDocuments : undefined,
      },
      include: {
        parent: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Parent-student relationship updated successfully',
      parentStudent: {
        id: updated.id,
        parentId: updated.parent.id,
        parentDisplayId: updated.parent.parentId,
        parentUserId: updated.parent.userId,
        firstName: updated.parent.user.firstName,
        lastName: updated.parent.user.lastName,
        email: updated.parent.user.email,
        phone: updated.parent.user.phone,
        relationship: updated.relationship,
        isPrimary: updated.isPrimary,
        canViewGrades: updated.canViewGrades,
        canViewAttendance: updated.canViewAttendance,
        canViewDocuments: updated.canViewDocuments,
      },
    })
  } catch (error) {
    console.error('[API] Error updating parent-student relationship:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// DELETE - Remove parent from student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized - No user in session' },
        { status: 401 }
      )
    }

    // Verify user is teacher
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { 
        id: true,
        role: true,
      },
    })

    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Forbidden - Teacher access required' },
        { status: 403 }
      )
    }

    // Find and delete parent-student relationship
    const parentStudent = await prisma.parentStudent.findUnique({
      where: { id },
    })

    if (!parentStudent) {
      return NextResponse.json(
        { error: 'Parent-student relationship not found' },
        { status: 404 }
      )
    }

    await prisma.parentStudent.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Parent removed from student successfully',
    })
  } catch (error) {
    console.error('[API] Error removing parent from student:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

