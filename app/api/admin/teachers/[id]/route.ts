import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Get teacher details by teacherModelId
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

    // Fetch teacher by teacherModelId
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      select: {
        id: true,
        teacherId: true,
        department: true,
        status: true,
        rating: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            bio: true,
          },
        },
        courses: {
          select: {
            id: true,
            courseCode: true,
            name: true,
            credits: true,
            department: true,
            status: true,
            enrollments: {
              select: {
                semester: {
                  select: {
                    name: true,
                  },
                },
              },
              take: 1,
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Map status enum to string
    const statusMap: Record<string, string> = {
      'active': 'active',
      'on_leave': 'on-leave',
      'inactive': 'inactive',
    }

    // Format response
    return NextResponse.json({
      teacher: {
        id: teacher.teacherId || `T-${teacher.id.slice(0, 8).toUpperCase()}`,
        teacherModelId: teacher.id,
        name: `${teacher.user.firstName} ${teacher.user.lastName || ''}`.trim() || teacher.user.email,
        email: teacher.user.email,
        phone: teacher.user.phone,
        bio: teacher.user.bio,
        department: teacher.department || 'General',
        status: statusMap[teacher.status] || 'active',
        rating: teacher.rating || 0,
        office: null,
        officeHours: null,
        courses: teacher.courses.map((course) => ({
          id: course.id,
          courseCode: course.courseCode,
          name: course.name,
          credits: course.credits,
          semester: course.enrollments?.[0]?.semester?.name || null,
          department: course.department,
          status: course.status,
        })),
      },
    })
  } catch (error) {
    console.error('[API] Error fetching teacher details:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// PUT - Update teacher information
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

    // Find teacher by teacherModelId
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Map status string to enum
    const statusMap: Record<string, 'active' | 'on_leave' | 'inactive'> = {
      'active': 'active',
      'on-leave': 'on_leave',
      'inactive': 'inactive',
    }

    // Prepare update data
    const teacherUpdateData: any = {}

    if (body.status !== undefined) {
      teacherUpdateData.status = statusMap[body.status] || 'active'
    }

    if (body.department !== undefined) {
      teacherUpdateData.department = body.department || null
    }

    if (body.rating !== undefined && body.rating !== null) {
      teacherUpdateData.rating = parseFloat(body.rating)
    }

    if (body.office !== undefined) {
      teacherUpdateData.office = body.office || null
    }

    if (body.officeHours !== undefined) {
      teacherUpdateData.officeHours = body.officeHours || null
    }

    // Update teacher
    await prisma.teacher.update({
      where: { id },
      data: teacherUpdateData,
    })

    return NextResponse.json({
      message: 'Teacher updated successfully',
      success: true,
    })
  } catch (error) {
    console.error('[API] Error updating teacher:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a teacher
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

    // Find teacher by teacherModelId
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      select: { id: true, teacherId: true },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Delete teacher (this will cascade delete related records due to onDelete: Cascade)
    await prisma.teacher.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Teacher deleted successfully',
      success: true,
    })
  } catch (error) {
    console.error('[API] Error deleting teacher:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

