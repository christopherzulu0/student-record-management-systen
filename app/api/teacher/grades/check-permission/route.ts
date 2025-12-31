import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Check if teacher has permission to record grades for a course
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Clerk session
    let clerkUser
    try {
      clerkUser = await currentUser()
    } catch (clerkError: any) {
      // Handle Clerk API errors gracefully
      console.error('[API] Clerk authentication error:', clerkError)
      return NextResponse.json(
        {
          hasPermission: false,
          error: 'Authentication error',
          details: 'Unable to verify user session. Please try logging in again.',
        },
        { status: 401 }
      )
    }

    if (!clerkUser) {
      return NextResponse.json(
        {
          hasPermission: false,
          error: 'Unauthorized - No user in session',
          details: 'Please log in to continue.',
        },
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

    // Get courseId from query params
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    // Check permission using the same logic as the grade recording API
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { 
        teacherId: true, 
        gradeRecordingTeacherId: true,
        status: true,
        courseCode: true,
        name: true,
      },
    })

    if (!course) {
      return NextResponse.json(
        { hasPermission: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    // Get all teachers assigned to this course (from junction table)
    let assignedTeacherIds = new Set<string>()
    if (course.teacherId) {
      assignedTeacherIds.add(course.teacherId)
    }
    
    // Try to get teachers from junction table (will work after migration)
    try {
      const courseTeachers = await (prisma as any).courseTeacher.findMany({
        where: { courseId },
        select: { teacherId: true },
      })
      courseTeachers.forEach((ct: { teacherId: string }) => {
        assignedTeacherIds.add(ct.teacherId)
      })
    } catch (error) {
      // If CourseTeacher table doesn't exist yet, just use teacherId
    }

    // Check if teacher is assigned to the course
    const isAssignedTeacher = assignedTeacherIds.has(teacher.id)
    const assignedTeachersCount = assignedTeacherIds.size

    // Permission logic:
    // 1. If only one teacher is assigned, they have permission automatically
    // 2. If more than one teacher is assigned, a gradeRecordingTeacherId MUST be set
    // 3. If gradeRecordingTeacherId is set, only that teacher has permission
    let hasPermission = false
    let errorMessage = ''
    let details = ''

    if (assignedTeachersCount <= 1) {
      // Single teacher assigned - allow if it's this teacher
      hasPermission = isAssignedTeacher
      if (!isAssignedTeacher) {
        errorMessage = 'You are not assigned to this course'
        details = 'Only the assigned teacher can record grades.'
      }
    } else {
      // Multiple teachers assigned - MUST have a gradeRecordingTeacherId set
      if (!course.gradeRecordingTeacherId) {
        hasPermission = false
        errorMessage = 'Grade recording teacher not assigned'
        details = 'Multiple teachers are assigned to this course. An admin must select which teacher is responsible for recording grades.'
      } else {
        // A specific teacher is assigned to record grades
        hasPermission = course.gradeRecordingTeacherId === teacher.id
        if (!hasPermission) {
          errorMessage = 'You are not the assigned grade recording teacher'
          details = 'Another teacher has been assigned to record grades for this course.'
        }
      }
    }

    return NextResponse.json({
      hasPermission,
      error: hasPermission ? null : errorMessage,
      details: hasPermission ? null : details,
    })
  } catch (error) {
    console.error('[API] Error checking grade recording permission:', error)
    return NextResponse.json(
      {
        hasPermission: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

