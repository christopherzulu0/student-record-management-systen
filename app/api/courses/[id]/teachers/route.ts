import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch all teachers assigned to a course
export async function GET(
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
    const { id: courseId } = resolvedParams

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Fetch teachers from junction table (will work after migration)
    let teachers: Array<{ id: string; teacherId: string | null; name: string; email: string; department: string | null }> = []
    try {
      const courseTeacherRecords = await (prisma as any).courseTeacher.findMany({
        where: { courseId },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      })

      teachers = courseTeacherRecords.map((ct: any) => ({
        id: ct.teacher.id,
        teacherId: ct.teacher.teacherId,
        name: `${ct.teacher.user.firstName} ${ct.teacher.user.lastName}`.trim() || ct.teacher.user.email,
        email: ct.teacher.user.email,
        department: ct.teacher.department,
      }))
    } catch (error) {
      // If CourseTeacher table doesn't exist yet, return empty array
      teachers = []
    }

    return NextResponse.json({ teachers })
  } catch (error) {
    console.error('[API] Error fetching course teachers:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// POST - Assign multiple teachers to a course
export async function POST(
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
    const { id: courseId } = resolvedParams

    const body = await request.json()
    const { teacherIds } = body

    if (!Array.isArray(teacherIds)) {
      return NextResponse.json(
        { error: 'teacherIds must be an array' },
        { status: 400 }
      )
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Validate all teachers exist
    if (teacherIds.length > 0) {
      const teachers = await prisma.teacher.findMany({
        where: {
          id: { in: teacherIds },
        },
        select: { id: true },
      })

      if (teachers.length !== teacherIds.length) {
        return NextResponse.json(
          { error: 'One or more teachers not found' },
          { status: 404 }
        )
      }
    }

    // Remove all existing course-teacher relationships (will work after migration)
    try {
      await (prisma as any).courseTeacher.deleteMany({
        where: { courseId },
      })
    } catch (error) {
      // If CourseTeacher table doesn't exist yet, skip deletion
    }

    // Create new course-teacher relationships (will work after migration)
    if (teacherIds.length > 0) {
      try {
        await (prisma as any).courseTeacher.createMany({
          data: teacherIds.map(teacherId => ({
            courseId,
            teacherId,
          })),
          skipDuplicates: true,
        })
      } catch (error) {
        // If CourseTeacher table doesn't exist yet, fall back to updating primary teacherId
        // This maintains backward compatibility until migration is applied
        if (teacherIds.length > 0) {
          await prisma.course.update({
            where: { id: courseId },
            data: {
              teacherId: teacherIds[0], // Set first teacher as primary
            },
          })
        }
      }
    }

    // Also update the primary teacherId (first teacher in the list, or null if empty)
    await prisma.course.update({
      where: { id: courseId },
      data: {
        teacherId: teacherIds.length > 0 ? teacherIds[0] : null,
      },
    })

    // Fetch updated teachers from junction table (will work after migration)
    let teachers: Array<{ id: string; teacherId: string | null; name: string; email: string; department: string | null }> = []
    try {
      const courseTeacherRecords = await (prisma as any).courseTeacher.findMany({
        where: { courseId },
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
        },
      })

      teachers = courseTeacherRecords.map((ct: any) => ({
        id: ct.teacher.id,
        teacherId: ct.teacher.teacherId,
        name: `${ct.teacher.user.firstName} ${ct.teacher.user.lastName}`.trim() || ct.teacher.user.email,
        email: ct.teacher.user.email,
        department: ct.teacher.department,
      }))
    } catch (error) {
      // If CourseTeacher table doesn't exist yet, fetch primary teacher
      const course = await prisma.course.findUnique({
        where: { id: courseId },
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
        },
      })

      if (course?.teacher) {
        teachers = [{
          id: course.teacher.id,
          teacherId: course.teacher.teacherId,
          name: `${course.teacher.user.firstName} ${course.teacher.user.lastName}`.trim() || course.teacher.user.email,
          email: course.teacher.user.email,
          department: course.teacher.department,
        }]
      }
    }

    return NextResponse.json({
      message: `Successfully assigned ${teachers.length} teacher(s) to course`,
      teachers,
    })
  } catch (error) {
    console.error('[API] Error assigning teachers to course:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

