import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper function to calculate letter grade from score
const getLetterGrade = (score: number): string => {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

// Helper function to check grade recording permissions
async function checkGradeRecordingPermission(
  teacherId: string,
  courseId: string
): Promise<{ hasPermission: boolean; error?: string; details?: string }> {
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
    return { hasPermission: false, error: 'Course not found' }
  }

  // Get all teachers assigned to this course (from junction table)
  // Note: This will work after migration is applied and Prisma client is regenerated
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
    // This is a fallback until migration is applied
  }

  // Check if teacher is assigned to the course
  const isAssignedTeacher = assignedTeacherIds.has(teacherId)
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
      errorMessage = 'Forbidden - You are not assigned to this course'
      details = 'Only the assigned teacher can record grades.'
    }
  } else {
    // Multiple teachers assigned - MUST have a gradeRecordingTeacherId set
    if (!course.gradeRecordingTeacherId) {
      hasPermission = false
      errorMessage = 'Forbidden - Grade recording teacher not assigned'
      details = 'Multiple teachers are assigned to this course. An admin must select which teacher is responsible for recording grades.'
    } else {
      // A specific teacher is assigned to record grades
      hasPermission = course.gradeRecordingTeacherId === teacherId
      if (!hasPermission) {
        errorMessage = 'Forbidden - You are not the assigned grade recording teacher'
        details = 'Another teacher has been assigned to record grades for this course.'
      }
    }
  }

  if (!hasPermission) {
    return {
      hasPermission: false,
      error: errorMessage,
      details: details,
    }
  }

  return { hasPermission: true }
}

// POST - Bulk record grades for all students in a course
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

    const body = await request.json()
    const { courseId, semesterId, studentGrades } = body

    // Validate required fields
    if (!courseId || !semesterId || !studentGrades || !Array.isArray(studentGrades)) {
      return NextResponse.json(
        { error: 'Course ID, semester ID, and studentGrades array are required' },
        { status: 400 }
      )
    }

    // Check grade recording permissions
    const permissionCheck = await checkGradeRecordingPermission(teacher.id, courseId)
    if (!permissionCheck.hasPermission) {
      return NextResponse.json(
        { 
          error: permissionCheck.error || 'Forbidden',
          details: permissionCheck.details,
        },
        { status: permissionCheck.error === 'Course not found' ? 404 : 403 }
      )
    }

    // Verify semester exists
    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
      select: { id: true },
    })

    if (!semester) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      )
    }

    // Record grades for all students in the studentGrades array
    const results = []
    const errors = []

    for (const studentGrade of studentGrades) {
      const { studentId, score, attendance, trend, assignmentType } = studentGrade

      if (!studentId || score === undefined || score === null || score === '') {
        errors.push({
          studentId: studentId || 'Unknown',
          studentName: 'Unknown',
          error: 'Student ID and score are required',
        })
        continue
      }

      try {
        // Verify student exists and is enrolled
        const enrollment = await prisma.enrollment.findFirst({
          where: {
            studentId: studentId,
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
          },
        })

        if (!enrollment) {
          errors.push({
            studentId: studentId,
            studentName: 'Unknown',
            error: 'Student is not enrolled in this course for the specified semester',
          })
          continue
        }

        // Check if grade already exists
        const existingGrade = await prisma.grade.findUnique({
          where: {
            studentId_courseId_semesterId: {
              studentId: enrollment.student.id,
              courseId,
              semesterId,
            },
          },
        })

        // Prepare assignments JSON with assignment type if provided
        const assignmentsData = assignmentType ? { type: assignmentType } : null

        const gradeData: any = {
          score: Number(score),
          letterGrade: getLetterGrade(Number(score)) as any,
          attendance: attendance !== null && attendance !== undefined && attendance !== '' 
            ? Number(attendance) 
            : null,
          trend: trend || undefined,
          teacherId: teacher.id,
        }

        if (assignmentsData !== null) {
          gradeData.assignments = assignmentsData
        }

        let grade
        if (existingGrade) {
          // Update existing grade
          grade = await prisma.grade.update({
            where: { id: existingGrade.id },
            data: gradeData,
          })
        } else {
          // Create new grade
          grade = await prisma.grade.create({
            data: {
              ...gradeData,
              studentId: enrollment.student.id,
              courseId,
              semesterId,
            },
          })
        }

        results.push({
          studentId: enrollment.student.studentId,
          studentName: `${enrollment.student.user.firstName} ${enrollment.student.user.lastName}`.trim(),
          grade: grade.score,
          letterGrade: grade.letterGrade,
        })
      } catch (error) {
        errors.push({
          studentId: studentId,
          studentName: 'Unknown',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      message: `Successfully recorded grades for ${results.length} student(s)`,
      results,
      errors: errors.length > 0 ? errors : undefined,
      total: studentGrades.length,
      successful: results.length,
      failed: errors.length,
    })
  } catch (error) {
    console.error('[API] Error bulk recording grades:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

