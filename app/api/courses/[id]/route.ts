import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// PUT/PATCH - Update a course
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
    const { courseCode, name, description, credits, department, departmentId, status } = body

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Validate required fields
    if (!courseCode || !name) {
      return NextResponse.json(
        { error: 'Course code and name are required' },
        { status: 400 }
      )
    }

    // Check if course code already exists (excluding current course)
    if (courseCode !== existingCourse.courseCode) {
      const codeExists = await prisma.course.findUnique({
        where: { courseCode },
      })

      if (codeExists) {
        return NextResponse.json(
          {
            error: `Course code "${courseCode}" already exists`,
            details: `A course with code "${courseCode}" already exists in the system.`,
          },
          { status: 409 }
        )
      }
    }

    // If departmentId is provided, get the department name
    let departmentName = department || null
    if (departmentId && !departmentName) {
      const dept = await prisma.department.findUnique({
        where: { id: departmentId },
        select: { name: true },
      })
      if (dept) {
        departmentName = dept.name
      }
    }

    // Handle description - trim if it's a string, otherwise set to null
    let descriptionValue: string | null = null
    if (description && typeof description === 'string') {
      const trimmed = description.trim()
      descriptionValue = trimmed !== '' ? trimmed : null
    }

    // Handle teacherId if provided
    let teacherIdValue = existingCourse.teacherId
    if (body.teacherId !== undefined) {
      // If teacherId is explicitly set to null or empty string, remove teacher assignment
      if (body.teacherId === null || body.teacherId === '') {
        teacherIdValue = null
      } else if (body.teacherId) {
        // Validate that the teacher exists
        const teacher = await prisma.teacher.findUnique({
          where: { id: body.teacherId },
        })
        if (!teacher) {
          return NextResponse.json(
            { error: 'Teacher not found' },
            { status: 404 }
          )
        }
        teacherIdValue = body.teacherId
      }
    }

    // Update course
    const course = await prisma.course.update({
      where: { id },
      data: {
        courseCode,
        name,
        description: descriptionValue,
        credits: credits ? (typeof credits === 'string' ? parseInt(credits) : credits) : existingCourse.credits,
        department: departmentName,
        departmentId: departmentId || null,
        status: status || existingCourse.status,
        teacherId: teacherIdValue,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        departmentRelation: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    })

    const formattedCourse = {
      id: course.id,
      courseCode: course.courseCode,
      name: course.name,
      description: course.description,
      credits: course.credits,
      department: course.department,
      departmentId: course.departmentId,
      status: course.status,
      teacherId: course.teacherId,
      teacher: course.teacher ? `${course.teacher.user?.firstName} ${course.teacher.user?.lastName}`.trim() : null,
      departmentName: course.departmentRelation?.name || course.department,
      enrolledStudents: course._count.enrollments,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    }

    return NextResponse.json(formattedCourse)
  } catch (error) {
    console.error('[API] Error updating course:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a course
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

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            enrollments: true,
            grades: true,
          },
        },
      },
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if course has related data
    const hasRelatedData = 
      existingCourse._count.enrollments > 0 ||
      existingCourse._count.grades > 0

    if (hasRelatedData) {
      return NextResponse.json(
        {
          error: 'Cannot delete course with related data',
          details: 'This course has enrollments or grades. Please remove related data first.',
          counts: {
            enrollments: existingCourse._count.enrollments,
            grades: existingCourse._count.grades,
          },
        },
        { status: 409 }
      )
    }

    // Delete course
    await prisma.course.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('[API] Error deleting course:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

