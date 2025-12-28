import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

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

// Helper function to convert letter grade to GPA points (4.0 scale)
const getGPAPoints = (letterGrade: string): number => {
  const gradeMap: Record<string, number> = {
    'A+': 4.0,
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'D-': 0.7,
    'F': 0.0,
  }
  return gradeMap[letterGrade] || 0.0
}

// GET - Fetch student's transcript
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

    // Verify user is student
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { 
        id: true,
        role: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    })

    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Forbidden - Student access required' },
        { status: 403 }
      )
    }

    // Get student record
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { 
        id: true,
        studentId: true,
        enrollmentDate: true,
        cumulativeGPA: true,
        totalCreditsEarned: true,
        totalCreditsRequired: true,
        status: true,
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student record not found' },
        { status: 404 }
      )
    }

    // Fetch all enrollments with courses and semesters
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
        semester: {
          startDate: 'desc',
        },
      },
    })

    // Fetch all grades for the student
    const grades = await prisma.grade.findMany({
      where: {
        studentId: student.id,
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
          },
        },
      },
    })

    // Group enrollments by semester
    const semestersMap = new Map<string, {
      semester: string
      semesterId: string
      startDate: Date
      courses: Array<{
        code: string
        name: string
        credits: number
        grade: string
        score: number
      }>
    }>()

    enrollments.forEach((enrollment) => {
      const semesterName = enrollment.semester.name
      const semesterId = enrollment.semester.id

      if (!semestersMap.has(semesterId)) {
        semestersMap.set(semesterId, {
          semester: semesterName,
          semesterId: semesterId,
          startDate: enrollment.semester.startDate,
          courses: [],
        })
      }

      // Find the grade for this enrollment
      const grade = grades.find(
        (g) => g.courseId === enrollment.courseId && g.semesterId === enrollment.semesterId
      )

      // Get letter grade
      let letterGrade: string = 'N/A'
      let score = 0

      if (grade) {
        score = Math.round(grade.score)
        // Convert Prisma enum to string if needed
        if (grade.letterGrade) {
          const enumValue = grade.letterGrade
          letterGrade = enumValue
            .replace(/_PLUS/g, '+')
            .replace(/_MINUS/g, '-')
        } else {
          letterGrade = getLetterGrade(score)
        }
      }

      const semesterData = semestersMap.get(semesterId)!
      semesterData.courses.push({
        code: enrollment.course.courseCode,
        name: enrollment.course.name,
        credits: enrollment.course.credits,
        grade: letterGrade,
        score: score,
      })
    })

    // Convert map to array and sort by start date (newest first)
    const semesters = Array.from(semestersMap.values())
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
      .map((sem) => {
        // Calculate semester Average (simple average of all scores)
        const coursesWithScores = sem.courses.filter((c) => c.score > 0)
        const semesterAverage = coursesWithScores.length > 0
          ? Number((coursesWithScores.reduce((sum, c) => sum + c.score, 0) / coursesWithScores.length).toFixed(2))
          : 0

        return {
          semester: sem.semester,
          average: semesterAverage,
          courses: sem.courses,
        }
      })

    // Calculate cumulative Average (simple average of all scores)
    const gradesWithScores = grades.filter((g) => g.score > 0)
    const cumulativeAverage = gradesWithScores.length > 0
      ? Number((gradesWithScores.reduce((sum, g) => sum + g.score, 0) / gradesWithScores.length).toFixed(2))
      : (student.cumulativeGPA || 0)

    // Calculate total credits earned (excluding F grades)
    let totalCreditsEarned = 0
    grades.forEach((grade) => {
      let letterGrade: string | null = null
      if (grade.letterGrade) {
        const enumValue = grade.letterGrade
        letterGrade = enumValue
          .replace(/_PLUS/g, '+')
          .replace(/_MINUS/g, '-')
      } else {
        letterGrade = getLetterGrade(grade.score)
      }

      if (letterGrade !== 'F') {
        const enrollment = enrollments.find(
          (e) => e.courseId === grade.courseId && e.semesterId === grade.semesterId
        )
        const credits = enrollment?.course.credits || grade.course.credits
        totalCreditsEarned += credits
      }
    })

    // Determine academic standing based on average
    let academicStanding = 'Good Standing'
    if (cumulativeAverage >= 90) {
      academicStanding = 'Excellent'
    } else if (cumulativeAverage < 60) {
      academicStanding = 'Academic Probation'
    } else if (cumulativeAverage < 70) {
      academicStanding = 'At Risk'
    }

    return NextResponse.json({
      studentName: `${user.firstName} ${user.lastName || ''}`.trim() || user.email,
      studentId: student.studentId,
      email: user.email,
      enrollmentDate: student.enrollmentDate.toISOString().split('T')[0],
      average: cumulativeAverage,
      totalCreditsEarned: totalCreditsEarned || student.totalCreditsEarned,
      totalCreditsRequired: student.totalCreditsRequired,
      academicStanding,
      semesters,
    })
  } catch (error) {
    console.error('[API] Error fetching student transcript:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

