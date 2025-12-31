import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch data needed for enrollment (courses, students, semesters)
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

    // Get teacher record
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher record not found' },
        { status: 404 }
      )
    }

    // Fetch teacher's courses from direct assignment (teacherId)
    const coursesDirect = await prisma.course.findMany({
      where: {
        OR: [
          { teacherId: teacher.id },
          { gradeRecordingTeacherId: teacher.id },
        ],
        status: 'active',
      },
      select: {
        id: true,
        courseCode: true,
        name: true,
        credits: true,
      },
      orderBy: {
        courseCode: 'asc',
      },
    })

    // Fetch courses from junction table (will work after migration)
    let coursesViaJunction: typeof coursesDirect = []
    try {
      const courseTeacherRecords = await (prisma as any).courseTeacher.findMany({
        where: { teacherId: teacher.id },
        select: { courseId: true },
      })
      
      if (courseTeacherRecords.length > 0) {
        const courseIds = courseTeacherRecords.map((ct: { courseId: string }) => ct.courseId)
        const courses = await prisma.course.findMany({
          where: {
            id: { in: courseIds },
            status: 'active',
          },
          select: {
            id: true,
            courseCode: true,
            name: true,
            credits: true,
          },
          orderBy: {
            courseCode: 'asc',
          },
        })
        coursesViaJunction = courses
      }
    } catch (error) {
      // If CourseTeacher table doesn't exist yet, skip
    }

    // Combine and deduplicate courses
    const allCourseIds = new Set(coursesDirect.map(c => c.id))
    coursesViaJunction.forEach(c => {
      if (!allCourseIds.has(c.id)) {
        allCourseIds.add(c.id)
      }
    })
    const courses = [...coursesDirect, ...coursesViaJunction.filter(c => !coursesDirect.some(cd => cd.id === c.id))]
      .sort((a, b) => a.courseCode.localeCompare(b.courseCode))

    // Fetch data in parallel (courses already fetched above)
    const [students, usersWithoutStudentProfile, semesters] = await Promise.all([
      // All students with Student profiles
      prisma.student.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          studentId: 'asc',
        },
      }),
      // Users with role "student" who don't have Student profiles yet
      prisma.user.findMany({
        where: {
          role: 'student',
          student: null, // No Student profile exists
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
        orderBy: {
          email: 'asc',
        },
      }),
      // All semesters (prioritize active ones)
      prisma.semester.findMany({
        orderBy: [
          { isActive: 'desc' },
          { startDate: 'desc' },
        ],
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          isActive: true,
        },
      }),
    ])

    // Format students with Student profiles
    const formattedStudents = students.map(student => ({
      id: student.id,
      studentId: student.studentId,
      userId: student.userId,
      name: `${student.user.firstName} ${student.user.lastName}`.trim(),
      email: student.user.email,
      hasProfile: true,
    }))

    // Format users without Student profiles (use userId as identifier)
    const formattedUsers = usersWithoutStudentProfile.map(user => ({
      id: user.id, // This is the userId, not studentId
      studentId: null, // No studentId yet
      userId: user.id,
      name: `${user.firstName} ${user.lastName || ''}`.trim(),
      email: user.email,
      hasProfile: false,
    }))

    // Combine both lists
    const allStudents = [...formattedStudents, ...formattedUsers]

    return NextResponse.json({
      courses,
      students: allStudents,
      semesters,
    })
  } catch (error) {
    console.error('[API] Error fetching enrollment data:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

