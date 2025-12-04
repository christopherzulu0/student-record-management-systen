import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// PUT/PATCH - Update a semester
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Get authenticated user from Clerk session
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized - No user in session' },
        { status: 401 }
      )
    }

    // Check if user is admin
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

    // Handle params as Promise (Next.js 15+) or object (Next.js 14)
    const resolvedParams = await Promise.resolve(params)
    const { id } = resolvedParams
    const body = await request.json()
    const { name, startDate, endDate, isActive } = body

    // Check if semester exists
    const existingSemester = await prisma.semester.findUnique({
      where: { id },
    })

    if (!existingSemester) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      )
    }

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Semester name, start date, and end date are required' },
        { status: 400 }
      )
    }

    // Validate date format
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Validate that end date is after start date
    if (end <= start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Check if semester name already exists (excluding current semester)
    if (name !== existingSemester.name) {
      const nameExists = await prisma.semester.findUnique({
        where: { name },
      })

      if (nameExists) {
        return NextResponse.json(
          {
            error: `Semester "${name}" already exists`,
            details: `A semester with name "${name}" already exists in the system.`,
          },
          { status: 409 }
        )
      }
    }

    // If this semester is being set as active, deactivate all other semesters
    if (isActive && !existingSemester.isActive) {
      await prisma.semester.updateMany({
        where: { 
          isActive: true,
          id: { not: id },
        },
        data: { isActive: false },
      })
    }

    // Update semester
    const semester = await prisma.semester.update({
      where: { id },
      data: {
        name,
        startDate: start,
        endDate: end,
        isActive: isActive !== undefined ? isActive : existingSemester.isActive,
      },
    })

    return NextResponse.json(semester)
  } catch (error) {
    console.error('[API] Error updating semester:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a semester
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Get authenticated user from Clerk session
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized - No user in session' },
        { status: 401 }
      )
    }

    // Check if user is admin
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

    // Handle params as Promise (Next.js 15+) or object (Next.js 14)
    const resolvedParams = await Promise.resolve(params)
    const { id } = resolvedParams

    // Check if semester exists
    const existingSemester = await prisma.semester.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            enrollments: true,
            grades: true,
            studentSemesters: true,
          },
        },
      },
    })

    if (!existingSemester) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      )
    }

    // Check if semester has related data
    const hasRelatedData = 
      existingSemester._count.enrollments > 0 ||
      existingSemester._count.grades > 0 ||
      existingSemester._count.studentSemesters > 0

    if (hasRelatedData) {
      return NextResponse.json(
        {
          error: 'Cannot delete semester with related data',
          details: 'This semester has enrollments, grades, or student records. Please remove related data first.',
          counts: {
            enrollments: existingSemester._count.enrollments,
            grades: existingSemester._count.grades,
            studentSemesters: existingSemester._count.studentSemesters,
          },
        },
        { status: 409 }
      )
    }

    // Delete semester
    await prisma.semester.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Semester deleted successfully' })
  } catch (error) {
    console.error('[API] Error deleting semester:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

