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

    // Fetch all semesters (including inactive ones) for the dropdown
    const allSemesters = await prisma.semester.findMany({
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
    })

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
              semesterId: enrollment.semester.id,
              semesterName: enrollment.semester.name,
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

        // Calculate average from all grades (simple average of scores)
        const gradesWithScores = canViewGrades ? grades.filter((g) => g.score > 0) : []
        const cumulativeAverage = gradesWithScores.length > 0
          ? Number((gradesWithScores.reduce((sum, g) => sum + g.score, 0) / gradesWithScores.length).toFixed(2))
          : 0

        // Calculate semester averages for history
        const averageHistory: Array<{ semester: string; average: number }> = []
        if (canViewGrades && grades.length > 0) {
          // Group grades by semester
          const gradesBySemester = new Map<string, number[]>()
          grades.forEach((grade) => {
            if (grade.score > 0) {
              if (!gradesBySemester.has(grade.semesterName)) {
                gradesBySemester.set(grade.semesterName, [])
              }
              gradesBySemester.get(grade.semesterName)!.push(grade.score)
            }
          })

          // Calculate average for each semester
          gradesBySemester.forEach((scores, semesterName) => {
            const semesterAverage = scores.length > 0
              ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2))
              : 0
            averageHistory.push({
              semester: semesterName,
              average: semesterAverage,
            })
          })

          // Sort by semester name
          averageHistory.sort((a, b) => a.semester.localeCompare(b.semester))
        }

        // Calculate current semester average (most recent semester with grades)
        const currentSemesterAverage = averageHistory.length > 0
          ? averageHistory[averageHistory.length - 1].average
          : cumulativeAverage

        return {
          id: student.id,
          studentId: student.studentId,
          firstName: student.user.firstName,
          lastName: student.user.lastName,
          program: student.program,
          yearOfStudy: student.yearOfStudy,
          average: cumulativeAverage,
          semesterAverage: currentSemesterAverage,
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
            semesterId: e.semester.id,
            semesterName: e.semester.name,
          })),
          grades: canViewGrades ? grades : [],
          documents: canViewDocuments ? documents : [],
          averageHistory,
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
      semesters: allSemesters.map((s) => ({
        id: s.id,
        name: s.name,
        isActive: s.isActive,
        startDate: s.startDate.toISOString(),
        endDate: s.endDate.toISOString(),
      })),
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

