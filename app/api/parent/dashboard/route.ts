import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper function to convert score to letter grade
const getLetterGrade = (score: number): string => {
  if (score >= 97) return 'A+'
  if (score >= 93) return 'A'
  if (score >= 90) return 'A-'
  if (score >= 87) return 'B+'
  if (score >= 83) return 'B'
  if (score >= 80) return 'B-'
  if (score >= 77) return 'C+'
  if (score >= 73) return 'C'
  if (score >= 70) return 'C-'
  if (score >= 67) return 'D+'
  if (score >= 63) return 'D'
  if (score >= 60) return 'D-'
  return 'F'
}

// GET - Fetch parent dashboard data with all children
export async function GET() {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized - No user in session' },
        { status: 401 }
      )
    }

    // Verify user is parent
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { 
        id: true,
        role: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    })

    if (!user || user.role !== 'parent') {
      return NextResponse.json(
        { error: 'Forbidden - Parent access required' },
        { status: 403 }
      )
    }

    // Get parent record
    const parent = await prisma.parent.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })

    if (!parent) {
      return NextResponse.json(
        { error: 'Parent record not found' },
        { status: 404 }
      )
    }

    // Fetch all parent-student relationships with permissions
    const parentStudents = await prisma.parentStudent.findMany({
      where: { parentId: parent.id },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            semesters: {
              include: {
                semester: {
                  select: {
                    name: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    })

    // Format children data
    const children = await Promise.all(
      parentStudents.map(async (ps) => {
        const student = ps.student
        const canViewGrades = ps.canViewGrades
        const canViewAttendance = ps.canViewAttendance
        const canViewDocuments = ps.canViewDocuments

        // Fetch enrollments
        const enrollments = await prisma.enrollment.findMany({
          where: {
            studentId: student.id,
            status: 'enrolled',
          },
          include: {
            course: {
              select: {
                id: true,
                courseCode: true,
                name: true,
                credits: true,
              },
            },
            semester: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
              },
            },
          },
          orderBy: {
            enrollmentDate: 'desc',
          },
        })

        // Fetch grades (only if permission allows)
        let grades: any[] = []
        if (canViewGrades) {
          const gradeRecords = await prisma.grade.findMany({
            where: { studentId: student.id },
            include: {
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
            orderBy: {
              updatedAt: 'desc',
            },
          })

          grades = enrollments.map((enrollment) => {
            const grade = gradeRecords.find(
              (g) => g.courseId === enrollment.courseId && g.semesterId === enrollment.semesterId
            )

            const score = grade?.score || 0
            const letterGrade = grade?.letterGrade
              ? grade.letterGrade.replace(/_PLUS/g, '+').replace(/_MINUS/g, '-')
              : score > 0
              ? getLetterGrade(score)
              : null

            // Calculate assignments from JSON if available
            const assignments = grade?.assignments
              ? typeof grade.assignments === 'object' && grade.assignments !== null
                ? Object.keys(grade.assignments).length
                : 0
              : 0

            const completed = grade?.assignments
              ? typeof grade.assignments === 'object' && grade.assignments !== null
                ? Object.values(grade.assignments).filter((v: any) => v !== null && v !== undefined).length
                : 0
              : 0

            return {
              courseCode: enrollment.course.courseCode,
              courseName: enrollment.course.name,
              score: Math.round(score),
              letterGrade: letterGrade || 'N/A',
              attendance: canViewAttendance ? (grade?.attendance || 0) : null,
              trend: grade?.trend || 'stable',
              assignments,
              completed,
            }
          })
        }

        // Fetch documents (only if permission allows)
        let documents: any[] = []
        if (canViewDocuments) {
          const documentRecords = await prisma.document.findMany({
            where: { studentId: student.id },
            orderBy: {
              createdAt: 'desc',
            },
          })

          documents = documentRecords.map((doc) => ({
            name: doc.name,
            status: doc.status,
            required: doc.required,
            expiryDate: doc.expiryDate ? doc.expiryDate.toISOString().split('T')[0] : null,
          }))
        }

        // Calculate semester GPA history
        const gpaHistory = student.semesters
          .filter((ss) => ss.semesterGPA !== null)
          .map((ss) => ({
            semester: ss.semester.name,
            gpa: ss.semesterGPA || 0,
          }))
          .sort((a, b) => {
            // Sort by semester name (assuming format like "Fall 2024")
            return a.semester.localeCompare(b.semester)
          })

        // Calculate current semester GPA (most recent)
        const currentSemesterGPA =
          student.semesters.length > 0 && student.semesters[0].semesterGPA
            ? student.semesters[0].semesterGPA
            : student.cumulativeGPA || 0

        return {
          id: student.id,
          studentId: student.studentId,
          firstName: student.user.firstName,
          lastName: student.user.lastName,
          program: student.program,
          yearOfStudy: student.yearOfStudy,
          cumulativeGPA: student.cumulativeGPA || 0,
          semesterGPA: currentSemesterGPA,
          totalCreditsEarned: student.totalCreditsEarned,
          totalCreditsRequired: student.totalCreditsRequired,
          status: student.status,
          expectedGraduation: student.expectedGraduation
            ? student.expectedGraduation.toISOString().split('T')[0]
            : null,
          enrollments: enrollments.map((e) => ({
            courseCode: e.course.courseCode,
            courseName: e.course.name,
            credits: e.course.credits,
            status: e.status,
          })),
          grades: canViewGrades ? grades : [],
          documents: canViewDocuments ? documents : [],
          gpaHistory,
          relationship: ps.relationship,
          isPrimary: ps.isPrimary,
        }
      })
    )

    return NextResponse.json({
      parent: {
        id: parent.id,
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        relationship: parentStudents.find((ps) => ps.isPrimary)?.relationship || null,
      },
      children,
    })
  } catch (error) {
    console.error('[API] Error fetching parent dashboard:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

