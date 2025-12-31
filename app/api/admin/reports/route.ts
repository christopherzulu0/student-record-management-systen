import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper function to convert letter grade to GPA points
function getGPAPoints(letterGrade: string): number {
  const gradeMap: Record<string, number> = {
    'A_PLUS': 4.0,
    'A': 4.0,
    'A_MINUS': 3.7,
    'B_PLUS': 3.3,
    'B': 3.0,
    'B_MINUS': 2.7,
    'C_PLUS': 2.3,
    'C': 2.0,
    'C_MINUS': 1.7,
    'D_PLUS': 1.3,
    'D': 1.0,
    'D_MINUS': 0.7,
    'F': 0.0,
  }
  return gradeMap[letterGrade] || 0
}

// GET - Fetch admin reports data
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

    // Verify user is admin
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

    // Fetch all data in parallel
    const [
      allStudents,
      allGrades,
      allEnrollments,
      allSemesters,
      departments,
      atRiskStudentsList,
    ] = await Promise.all([
      // All students with GPA
      prisma.student.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      // All grades
      prisma.grade.findMany({
        include: {
          course: {
            select: {
              id: true,
              credits: true,
              department: true,
            },
          },
        },
      }),
      // All enrollments
      prisma.enrollment.findMany({
        include: {
          course: {
            select: {
              id: true,
              credits: true,
              department: true,
            },
          },
          semester: {
            select: {
              name: true,
              startDate: true,
            },
          },
        },
      }),
      // All semesters
      prisma.semester.findMany({
        orderBy: {
          startDate: 'desc',
        },
        take: 10,
      }),
      // All departments
      prisma.department.findMany({
        select: {
          id: true,
          name: true,
        },
      }),
      // At-risk students (GPA < 2.5 or status = at_risk)
      prisma.student.findMany({
        where: {
          OR: [
            { cumulativeGPA: { lt: 2.5 } },
            { status: 'at_risk' },
          ],
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          cumulativeGPA: 'asc',
        },
        take: 50,
      }),
    ])

    // Calculate overview statistics - average from all grades
    const allGradeScores = allGrades.filter((g) => g.score !== null && g.score !== undefined).map((g) => g.score || 0)
    const systemAverage = allGradeScores.length > 0
      ? allGradeScores.reduce((sum, score) => sum + score, 0) / allGradeScores.length
        : 0

    // Calculate pass rate (grades >= 60 or letter grade >= D)
    const passingGrades = allGrades.filter((g) => {
      if (g.score !== null) {
        return g.score >= 60
      }
      if (g.letterGrade) {
        const gpaPoints = getGPAPoints(g.letterGrade)
        return gpaPoints >= 1.0 // D or better
      }
      return false
    })
    const passRate = allGrades.length > 0 ? (passingGrades.length / allGrades.length) * 100 : 0

    // Calculate graduation rate (students who completed required credits)
    const studentsCompleted = allStudents.filter((s) => {
      return (s.totalCreditsEarned || 0) >= (s.totalCreditsRequired || 60)
    })
    const graduationRate = allStudents.length > 0 ? (studentsCompleted.length / allStudents.length) * 100 : 0

    // Calculate semester trends
    const semesterTrends = allSemesters.map((semester) => {
      // Get enrollments for this semester
      const semesterEnrollments = allEnrollments.filter(
        (e) => e.semesterId === semester.id && e.status === 'enrolled'
      )

      // Get grades for this semester
      const semesterGrades = allGrades.filter((g) => g.semesterId === semester.id)

      // Calculate average for this semester (simple average of scores)
      const semesterScores = semesterGrades
        .filter((g) => g.score !== null && g.score !== undefined)
        .map((g) => g.score || 0)
      const semesterAverage = semesterScores.length > 0
        ? semesterScores.reduce((sum, score) => sum + score, 0) / semesterScores.length
        : 0

      return {
        semester: semester.name,
        avgAverage: Number(semesterAverage.toFixed(2)),
        enrolled: semesterEnrollments.length,
        graduated: 0, // This would require tracking graduation dates
      }
    })

    // Calculate department performance
    const departmentStats = departments.map((dept) => {
      // Get students in this department
      const deptStudents = allStudents.filter((s) => s.department === dept.name)
      
      // Get enrollments for this department's courses
      const deptEnrollments = allEnrollments.filter((e) => 
        e.course?.department === dept.name
      )

      // Get grades for this department's courses
      const deptGrades = allGrades.filter((g) => 
        g.course?.department === dept.name
      )

      // Calculate average for department (simple average of scores)
      const deptScores = deptGrades
        .filter((g) => g.score !== null && g.score !== undefined)
        .map((g) => g.score || 0)
      const deptAvgAverage = deptScores.length > 0
        ? deptScores.reduce((sum, score) => sum + score, 0) / deptScores.length
          : 0

      // Calculate pass rate for department
      const deptPassingGrades = deptGrades.filter((g) => {
        if (g.score !== null) {
          return g.score >= 60
        }
        if (g.letterGrade) {
          const gpaPoints = getGPAPoints(g.letterGrade)
          return gpaPoints >= 1.0
        }
        return false
      })
      const deptPassRate = deptGrades.length > 0 ? (deptPassingGrades.length / deptGrades.length) * 100 : 0

      return {
        dept: dept.name,
        students: deptStudents.length,
        avgAverage: Number(deptAvgAverage.toFixed(2)),
        passRate: Math.round(deptPassRate),
      }
    })

    // Format at-risk students - calculate average from their grades
    // Get all grades for at-risk students in one query
    const atRiskStudentIds = atRiskStudentsList.map((s) => s.id)
    const atRiskGrades = await prisma.grade.findMany({
      where: { studentId: { in: atRiskStudentIds } },
      select: { studentId: true, score: true },
    })
    
    // Group grades by student and calculate average
    const gradesByStudent = new Map<string, number[]>()
    atRiskGrades.forEach((grade) => {
      if (grade.score !== null && grade.score !== undefined) {
        const existing = gradesByStudent.get(grade.studentId) || []
        existing.push(grade.score)
        gradesByStudent.set(grade.studentId, existing)
      }
    })
    
    const formattedAtRiskStudents = atRiskStudentsList.map((student) => {
      const scores = gradesByStudent.get(student.id) || []
      const average = scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0
      return {
        id: student.studentId,
        name: `${student.user.firstName} ${student.user.lastName || ''}`.trim() || 'Unknown',
        average: Number(average.toFixed(2)),
        status: average < 70 ? 'Critical' : 'At Risk',
      }
    })

    return NextResponse.json({
      overview: {
        systemAverage: Number(systemAverage.toFixed(2)),
        passRate: Math.round(passRate),
        graduationRate: Math.round(graduationRate),
        atRiskCount: atRiskStudentsList.length,
      },
      semesterTrends,
      departments: departmentStats,
      atRiskStudents: formattedAtRiskStudents,
    })
  } catch (error) {
    console.error('[API] Error fetching admin reports:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

