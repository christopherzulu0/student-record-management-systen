import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
    const courses = await prisma.course.findMany({
      where: {
        teacherId: teacher.id,
        status: 'active',
      },
      select: {
        id: true,
        courseCode: true,
        name: true,
      },
      orderBy: {
        courseCode: 'asc',
      },
    })

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
          
          studentGrades.push({
            id: studentGrade.id,
            studentModelId: studentId, // Student model ID for API calls
            studentId: student.studentId,
            name: student.name,
            course: course.courseCode,
            currentGrade: Math.round(studentGrade.score),
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

    // Verify the course belongs to this teacher
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true, status: true },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (course.teacherId !== teacher.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only record grades for your own courses' },
        { status: 403 }
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

    // Calculate letter grade from score
    const getLetterGrade = (score: number): string => {
      if (score >= 97) return 'A_PLUS'
      if (score >= 93) return 'A'
      if (score >= 90) return 'A_MINUS'
      if (score >= 87) return 'B_PLUS'
      if (score >= 83) return 'B'
      if (score >= 80) return 'B_MINUS'
      if (score >= 77) return 'C_PLUS'
      if (score >= 73) return 'C'
      if (score >= 70) return 'C_MINUS'
      if (score >= 67) return 'D_PLUS'
      if (score >= 63) return 'D'
      if (score >= 60) return 'D_MINUS'
      return 'F'
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
    const assignmentsData = assignmentType ? { type: assignmentType } : undefined

    let grade
    if (existingGrade) {
      // Update existing grade
      grade = await prisma.grade.update({
        where: { id: existingGrade.id },
        data: {
          score: Number(score),
          letterGrade: getLetterGrade(Number(score)) as any,
          attendance: attendance !== null && attendance !== undefined && attendance !== '' 
            ? Number(attendance) 
            : null,
          trend: trend || undefined,
          comments: comments || undefined,
          assignments: assignmentsData || existingGrade.assignments, // Preserve existing assignments if not updating
          teacherId: teacher.id,
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

    return NextResponse.json({
      message: existingGrade ? 'Grade updated successfully' : 'Grade recorded successfully',
      grade: {
        id: grade.id,
        studentId: grade.student.studentId,
        studentName: `${grade.student.user.firstName} ${grade.student.user.lastName}`,
        courseCode: grade.course.courseCode,
        courseName: grade.course.name,
        semesterName: grade.semester.name,
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
