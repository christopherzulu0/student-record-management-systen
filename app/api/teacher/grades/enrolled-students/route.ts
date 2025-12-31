import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch enrolled students for a course and semester
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const semesterId = searchParams.get('semesterId')

    if (!courseId || !semesterId) {
      return NextResponse.json(
        { error: 'Course ID and semester ID are required' },
        { status: 400 }
      )
    }

    // Verify the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { 
        id: true,
        teacherId: true,
        gradeRecordingTeacherId: true,
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Verify semester exists
    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
      select: { id: true, name: true },
    })

    if (!semester) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      )
    }

    // Get all enrolled students for the course and semester
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: courseId,
        semesterId: semesterId,
        status: 'enrolled',
      },
      include: {
        student: {
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
        course: {
          select: {
            courseCode: true,
            name: true,
          },
        },
      },
      orderBy: {
        student: {
          studentId: 'asc',
        },
      },
    })

    // Get existing grades for these students
    const studentIds = enrollments.map(e => e.student.id)
    const existingGrades = await prisma.grade.findMany({
      where: {
        studentId: { in: studentIds },
        courseId: courseId,
        semesterId: semesterId,
      },
      select: {
        studentId: true,
        score: true,
        attendance: true,
        trend: true,
        assignments: true,
      },
    })

    // Create a map of existing grades by studentId
    const gradesMap = new Map(
      existingGrades.map(g => [g.studentId, g])
    )

    // Format response
    const students = enrollments.map(enrollment => {
      const existingGrade = gradesMap.get(enrollment.student.id)
      const assignments = existingGrade?.assignments as any
      
      return {
        studentId: enrollment.student.id,
        studentDisplayId: enrollment.student.studentId,
        name: `${enrollment.student.user.firstName} ${enrollment.student.user.lastName}`.trim(),
        email: enrollment.student.user.email,
        existingGrade: existingGrade ? {
          score: existingGrade.score,
          attendance: existingGrade.attendance,
          trend: existingGrade.trend,
          assignmentType: assignments?.type || null,
        } : null,
      }
    })

    return NextResponse.json({
      students,
      course: {
        id: course.id,
        courseCode: enrollments[0]?.course.courseCode,
        name: enrollments[0]?.course.name,
      },
      semester: {
        id: semester.id,
        name: semester.name,
      },
      total: students.length,
    })
  } catch (error) {
    console.error('[API] Error fetching enrolled students:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

