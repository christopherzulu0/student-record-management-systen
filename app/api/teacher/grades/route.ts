import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

// Helper function to calculate letter grade from score
const getLetterGrade = (score: number): string => {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

// GET - Fetch teacher's grades data
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

    // Fetch teacher's courses
    // Include courses where teacher is assigned (via teacherId, gradeRecordingTeacherId, or courseTeachers junction table)
    // First get courses via direct relationships
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
        teacherId: true,
        gradeRecordingTeacherId: true,
      },
      orderBy: {
        courseCode: 'asc',
      },
    })

    // Get courses via junction table (will work after migration)
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
            teacherId: true,
            gradeRecordingTeacherId: true,
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

    const courseIds = courses.map(c => c.id)

    if (courseIds.length === 0) {
      return NextResponse.json({
        courses: [],
        gradesByCourse: {},
      })
    }

    // Fetch enrollments for teacher's courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: { in: courseIds },
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
            id: true,
            courseCode: true,
            name: true,
          },
        },
        semester: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
      distinct: ['studentId', 'courseId'],
    })

    // Fetch grades for enrolled students in teacher's courses
    // Using select to explicitly get all needed fields including assignments
    const grades = await prisma.grade.findMany({
      where: {
        courseId: { in: courseIds },
        teacherId: teacher.id,
      },
      select: {
        id: true,
        studentId: true,
        courseId: true,
        semesterId: true,
        score: true,
        letterGrade: true,
        attendance: true, // Explicitly select attendance
        trend: true,
        assignments: true, // Explicitly select assignments
        comments: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            studentId: true,
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
            id: true,
            courseCode: true,
            name: true,
          },
        },
        semester: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Group grades by course and student
    const gradesByCourse: Record<string, any> = {}

    for (const course of courses) {
      // Get enrollments for this course
      const courseEnrollments = enrollments.filter(e => e.courseId === course.id)
      
      // Get unique students for this course
      const studentMap = new Map<string, any>()
      
      for (const enrollment of courseEnrollments) {
        const studentId = enrollment.student.id
        if (!studentMap.has(studentId)) {
          // Get the most recent enrollment for this student in this course
          const studentEnrollments = courseEnrollments.filter(e => e.studentId === studentId)
          const latestEnrollment = studentEnrollments.sort((a, b) => 
            b.enrollmentDate.getTime() - a.enrollmentDate.getTime()
          )[0]
          
          studentMap.set(studentId, {
            id: enrollment.student.id,
            studentId: enrollment.student.studentId,
            name: `${enrollment.student.user.firstName} ${enrollment.student.user.lastName}`.trim(),
            email: enrollment.student.user.email,
            semesterId: latestEnrollment.semester.id,
            semesterName: latestEnrollment.semester.name,
          })
        }
      }

      // Get latest grade for each student in this course
      const courseGrades = grades.filter(g => g.courseId === course.id)
      
      const studentGrades: any[] = []
      
      for (const [studentId, student] of studentMap.entries()) {
        // Find the most recent grade for this student in this course
        const studentGrade = courseGrades
          .filter(g => g.studentId === studentId)
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0]

        if (studentGrade) {
          // Parse assignments JSON to get assignment type if stored
          let assignmentType = ''
          try {
            if (studentGrade.assignments) {
              // Handle both JSON string and object
              const assignments = typeof studentGrade.assignments === 'string' 
                ? JSON.parse(studentGrade.assignments) 
                : studentGrade.assignments
              if (assignments && typeof assignments === 'object') {
                assignmentType = assignments.type || assignments.assignmentType || ''
              }
            }
          } catch (error) {
            console.error('[API] Error parsing assignments:', error)
          }
          
          // Recalculate letter grade based on current score to ensure consistency
          const roundedScore = Math.round(studentGrade.score)
          const recalculatedLetterGrade = getLetterGrade(roundedScore)
          
          studentGrades.push({
            id: studentGrade.id,
            studentModelId: studentId, // Student model ID for API calls
            studentId: student.studentId,
            name: student.name,
            course: course.courseCode,
            currentGrade: roundedScore,
            attendance: studentGrade.attendance !== null && studentGrade.attendance !== undefined 
              ? Math.round(studentGrade.attendance) 
              : null,
            trend: studentGrade.trend || 'stable',
            semesterId: student.semesterId,
            semesterName: student.semesterName,
            assignmentType: assignmentType,
            comments: studentGrade.comments || null,
          })
        } else {
          // Student enrolled but no grade yet
          studentGrades.push({
            id: `pending-${studentId}`,
            studentModelId: studentId, // Student model ID for API calls
            studentId: student.studentId,
            name: student.name,
            course: course.courseCode,
            currentGrade: 0,
            attendance: null, // null for students without grades
            trend: 'stable',
            semesterId: student.semesterId,
            semesterName: student.semesterName,
            assignmentType: '',
            comments: null,
          })
        }
      }

      // Calculate statistics for this course
      const gradesWithScores = studentGrades.filter(g => g.currentGrade > 0)
      const avgGrade = gradesWithScores.length > 0
        ? Math.round(gradesWithScores.reduce((sum, g) => sum + g.currentGrade, 0) / gradesWithScores.length)
        : 0
      const gradesWithAttendance = studentGrades.filter(g => g.attendance !== null && g.attendance !== undefined)
      const avgAttendance = gradesWithAttendance.length > 0
        ? Math.round(gradesWithAttendance.reduce((sum, g) => sum + (g.attendance || 0), 0) / gradesWithAttendance.length)
        : 0
      const excellentCount = studentGrades.filter(g => g.currentGrade >= 90).length
      const needsHelpCount = studentGrades.filter(g => g.currentGrade > 0 && g.currentGrade < 70).length

      gradesByCourse[course.id] = {
        courseId: course.id,
        courseCode: course.courseCode,
        courseName: course.name,
        students: studentGrades,
        statistics: {
          total: studentGrades.length,
          avgGrade,
          avgAttendance,
          excellentCount,
          needsHelpCount,
        },
      }
    }

    return NextResponse.json({
      courses: courses.map(c => ({
        id: c.id,
        courseCode: c.courseCode,
        name: c.name,
        displayName: `${c.courseCode} - ${c.name}`,
      })),
      gradesByCourse,
    })
  } catch (error) {
    console.error('[API] Error fetching teacher grades:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// POST - Create or update a grade
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
    const { studentId, courseId, semesterId, score, attendance, trend, comments, assignmentType } = body

    // Validate required fields
    if (!studentId || !courseId || !semesterId || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, courseId, semesterId, and score are required' },
        { status: 400 }
      )
    }

    // Validate score range
    if (score < 0 || score > 100) {
      return NextResponse.json(
        { error: 'Score must be between 0 and 100' },
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

    // Verify student exists and is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: studentId,
        courseId: courseId,
        semesterId: semesterId,
        status: 'enrolled',
      },
      include: {
        student: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Student is not enrolled in this course for the specified semester' },
        { status: 404 }
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

    // Use the helper function defined at the top of the file

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

    let grade
    if (existingGrade) {
      // Update existing grade
      const updateData: any = {
        score: Number(score),
        letterGrade: getLetterGrade(Number(score)) as any,
        attendance: attendance !== null && attendance !== undefined && attendance !== '' 
          ? Number(attendance) 
          : null,
        trend: trend || undefined,
        comments: comments || undefined,
        teacherId: teacher.id,
      }
      
      // Only update assignments if assignmentType is provided
      if (assignmentsData !== null) {
        updateData.assignments = assignmentsData
      }
      
      grade = await prisma.grade.update({
        where: { id: existingGrade.id },
        data: updateData,
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
    } else {
      // Create new grade
      grade = await prisma.grade.create({
        data: {
          studentId: enrollment.student.id,
          courseId,
          semesterId,
          teacherId: teacher.id,
          score: Number(score),
          letterGrade: getLetterGrade(Number(score)) as any,
          attendance: attendance !== null && attendance !== undefined && attendance !== '' 
            ? Number(attendance) 
            : null,
          trend: trend || 'stable',
          comments: comments || undefined,
          assignments: assignmentsData || undefined,
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
    }

    // Type assertion for Prisma include relations
    const gradeWithRelations = grade as typeof grade & {
      student: {
        studentId: string
        user: {
          firstName: string
          lastName: string
          email: string
        }
      }
      course: {
        courseCode: string
        name: string
      }
      semester: {
        name: string
      }
    }

    return NextResponse.json({
      message: existingGrade ? 'Grade updated successfully' : 'Grade recorded successfully',
      grade: {
        id: grade.id,
        studentId: gradeWithRelations.student.studentId,
        studentName: `${gradeWithRelations.student.user.firstName} ${gradeWithRelations.student.user.lastName}`,
        courseCode: gradeWithRelations.course.courseCode,
        courseName: gradeWithRelations.course.name,
        semesterName: gradeWithRelations.semester.name,
        score: grade.score,
        letterGrade: grade.letterGrade,
        attendance: grade.attendance,
        trend: grade.trend,
      },
    })
  } catch (error) {
    console.error('[API] Error recording grade:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
