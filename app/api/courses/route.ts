import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch all courses
export async function GET() {
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

    // Fetch all courses
    const courses = await prisma.course.findMany({
      orderBy: {
        courseCode: 'asc',
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
        gradeRecordingTeacher: {
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

    // Get all course-teacher relationships from junction table
    const allCourseTeachers: Record<string, Array<{ teacherId: string; name: string }>> = {}
    try {
      const courseTeacherRecords = await (prisma as any).courseTeacher.findMany({
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
      
      courseTeacherRecords.forEach((ct: any) => {
        if (!allCourseTeachers[ct.courseId]) {
          allCourseTeachers[ct.courseId] = []
        }
        allCourseTeachers[ct.courseId].push({
          teacherId: ct.teacherId,
          name: `${ct.teacher.user?.firstName} ${ct.teacher.user?.lastName}`.trim() || ct.teacher.user?.email,
        })
      })
    } catch (error) {
      // If CourseTeacher table doesn't exist yet, skip
    }

    const formattedCourses = courses.map(course => {
      // Get all teachers assigned to the course (from junction table)
      const junctionTeachers = allCourseTeachers[course.id] || []
      const allTeachers = junctionTeachers.map(ct => ct.name)
      
      // Primary teacher (for backward compatibility)
      const primaryTeacher = course.teacher 
        ? `${course.teacher.user?.firstName} ${course.teacher.user?.lastName}`.trim() 
        : null

      // Combine all teachers (deduplicate)
      const uniqueTeachers = Array.from(new Set([...allTeachers, ...(primaryTeacher ? [primaryTeacher] : [])]))

      return {
        id: course.id,
        courseCode: course.courseCode,
        name: course.name,
        description: course.description,
        credits: course.credits,
        department: course.department,
        departmentId: course.departmentId,
        status: course.status,
        teacherId: course.teacherId,
        teacher: primaryTeacher || (uniqueTeachers.length > 0 ? uniqueTeachers[0] : null),
        teachers: uniqueTeachers,
        teacherCount: uniqueTeachers.length,
        gradeRecordingTeacherId: course.gradeRecordingTeacherId,
        gradeRecordingTeacher: course.gradeRecordingTeacher ? `${course.gradeRecordingTeacher.user?.firstName} ${course.gradeRecordingTeacher.user?.lastName}`.trim() : null,
        departmentName: course.departmentRelation?.name || course.department,
        enrolledStudents: course._count.enrollments,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
      }
    })

    return NextResponse.json(formattedCourses)
  } catch (error) {
    console.error('[API] Error fetching courses:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// POST - Create a new course
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { courseCode, name, description, credits, department, departmentId } = body

    // Validate required fields
    if (!courseCode || !name) {
      return NextResponse.json(
        { error: 'Course code and name are required' },
        { status: 400 }
      )
    }

    // Check if course code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { courseCode },
      select: {
        courseCode: true,
        name: true,
        id: true,
      },
    })

    if (existingCourse) {
      return NextResponse.json(
        { 
          error: `Course code "${courseCode}" already exists`,
          details: `A course with code "${courseCode}" (${existingCourse.name}) already exists in the system.`,
          existingCourse: {
            id: existingCourse.id,
            courseCode: existingCourse.courseCode,
            name: existingCourse.name,
          },
        },
        { status: 409 }
      )
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

    // Create course
    const course = await prisma.course.create({
      data: {
        courseCode,
        name,
        description: descriptionValue,
        credits: credits ? (typeof credits === 'string' ? parseInt(credits) : credits) : 3,
        department: departmentName,
        departmentId: departmentId || null,
        status: 'active',
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

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('[API] Error creating course:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

