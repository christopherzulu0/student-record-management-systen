import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - Enroll a student in a course
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
    const { studentId, courseId, semesterId } = body

    if (!studentId || !courseId || !semesterId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, courseId, and semesterId are required' },
        { status: 400 }
      )
    }

    // Verify the course exists and check if teacher is assigned
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { 
        teacherId: true, 
        gradeRecordingTeacherId: true,
        status: true 
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if teacher is assigned via primary teacherId or gradeRecordingTeacherId
    let isAssignedTeacher = course.teacherId === teacher.id || course.gradeRecordingTeacherId === teacher.id

    // Check if teacher is assigned via CourseTeacher junction table
    if (!isAssignedTeacher) {
      try {
        const courseTeacher = await (prisma as any).courseTeacher.findFirst({
          where: {
            courseId: courseId,
            teacherId: teacher.id,
          },
        })
        isAssignedTeacher = !!courseTeacher
      } catch (error) {
        // If CourseTeacher table doesn't exist yet, skip
      }
    }

    if (!isAssignedTeacher) {
      return NextResponse.json(
        { error: 'Forbidden - You can only enroll students in courses you are assigned to' },
        { status: 403 }
      )
    }

    if (course.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot enroll students in inactive courses' },
        { status: 400 }
      )
    }

    // Check if studentId is actually a userId (user without Student profile)
    let student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    })

    // If student not found, check if it's a userId
    if (!student) {
      const user = await prisma.user.findUnique({
        where: { 
          id: studentId,
          role: 'student',
        },
        include: {
          student: true,
        },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        )
      }

      // If user exists but doesn't have Student profile, create one
      if (!user.student) {
        // Generate unique studentId
        const generateStudentId = async (): Promise<string> => {
          let counter = 1
          let newStudentId: string
          let exists = true

          while (exists) {
            newStudentId = `STU${String(counter).padStart(4, '0')}`
            const existing = await prisma.student.findUnique({
              where: { studentId: newStudentId },
            })
            exists = !!existing
            if (!exists) break
            counter++
          }

          return newStudentId!
        }

        const newStudentId = await generateStudentId()

        // Create Student profile from User data
        const newStudent = await prisma.student.create({
          data: {
            userId: user.id,
            studentId: newStudentId,
            enrollmentDate: new Date(),
            status: 'active',
            // Copy emergency contact from User if available
            emergencyContactName: user.EmergencyContactName || null,
            emergencyContactPhone: user.EmergencyContactNumber || null,
          },
        })

        student = { id: newStudent.id }
      } else {
        // User has Student profile, use it
        student = { id: user.student.id }
      }
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

    // Use the actual Student model ID (not the userId that might have been passed)
    const actualStudentId = student.id

    // First, check if student is already enrolled in this course in ANY semester with 'enrolled' status
    const existingActiveEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: actualStudentId,
        courseId: courseId,
        status: 'enrolled', // Only check active enrollments
      },
      include: {
        semester: {
          select: {
            name: true,
          },
        },
      },
    })

    if (existingActiveEnrollment) {
      return NextResponse.json(
        { 
          error: `Student is already enrolled in this course for ${existingActiveEnrollment.semester.name}. Please drop the existing enrollment first if you want to re-enroll.`,
        },
        { status: 409 }
      )
    }

    // Check if enrollment already exists for this specific semester (for re-enrollment after dropping)
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId_semesterId: {
          studentId: actualStudentId,
          courseId,
          semesterId,
        },
      },
    })

    if (existingEnrollment) {
      // If enrollment exists but status is not 'enrolled' (e.g., 'dropped'), update it
      if (existingEnrollment.status !== 'enrolled') {
        const updatedEnrollment = await prisma.enrollment.update({
          where: { id: existingEnrollment.id },
          data: {
            status: 'enrolled',
            enrollmentDate: new Date(),
          },
        })
        return NextResponse.json({
          message: 'Student re-enrolled successfully',
          enrollment: updatedEnrollment,
        })
      }
      // This should not happen due to the check above, but handle it just in case
      return NextResponse.json(
        { error: 'Student is already enrolled in this course for this semester' },
        { status: 409 }
      )
    }

    // Create new enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: actualStudentId,
        courseId,
        semesterId,
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
        semester: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Student enrolled successfully',
      enrollment: {
        id: enrollment.id,
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        semesterId: enrollment.semesterId,
        studentName: `${enrollment.student.user.firstName} ${enrollment.student.user.lastName}`,
        courseCode: enrollment.course.courseCode,
        courseName: enrollment.course.name,
        semesterName: enrollment.semester.name,
        status: enrollment.status,
        enrollmentDate: enrollment.enrollmentDate,
      },
    })
  } catch (error) {
    console.error('[API] Error enrolling student:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

