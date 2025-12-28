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

// GET - Fetch student's grades
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
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student record not found' },
        { status: 404 }
      )
    }

    // Fetch all enrollments
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
          },
        },
      },
      orderBy: {
        enrollmentDate: 'desc',
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
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Format grades data
    const formattedGrades = enrollments.map((enrollment) => {
      // Find the grade for this enrollment (course + semester)
      const grade = grades.find(
        (g) => g.courseId === enrollment.courseId && g.semesterId === enrollment.semesterId
      )

      // Get letter grade from grade or calculate from score
      let letterGrade: string | null = null
      let score = grade?.score || 0
      
      // Convert Prisma enum to string if needed
      if (grade?.letterGrade) {
        const enumValue = grade.letterGrade
        // Convert enum values like A_PLUS, A_MINUS, B_PLUS, etc. to A+, A-, B+, etc.
        letterGrade = enumValue
          .replace(/_PLUS/g, '+')
          .replace(/_MINUS/g, '-')
      } else if (score > 0) {
        letterGrade = getLetterGrade(score)
      }

      return {
        id: grade?.id || `pending-${enrollment.id}`,
        course: enrollment.course.courseCode,
        courseCode: enrollment.course.courseCode,
        courseName: enrollment.course.name,
        grade: letterGrade || 'N/A',
        score: Math.round(score),
        credits: enrollment.course.credits,
        semester: enrollment.semester.name,
        semesterId: enrollment.semester.id,
      }
    })

    // Calculate statistics
    const gradesWithScores = formattedGrades.filter((g) => g.score > 0)
    
    // Calculate Average (simple average of all scores)
    const average = gradesWithScores.length > 0
      ? Number((gradesWithScores.reduce((sum, g) => sum + g.score, 0) / gradesWithScores.length).toFixed(2))
      : 0
    
    // Calculate credits earned
    let creditsEarned = 0
    gradesWithScores.forEach((grade) => {
      if (grade.grade !== 'F') {
        creditsEarned += grade.credits
      }
    })
    
    // Calculate average grade (letter grade)
    const avgScore = gradesWithScores.length > 0
      ? Math.round(gradesWithScores.reduce((sum, g) => sum + g.score, 0) / gradesWithScores.length)
      : 0
    const averageGrade = avgScore > 0 ? getLetterGrade(avgScore) : 'N/A'

    // Get unique semesters for filtering
    const semesters = Array.from(new Set(formattedGrades.map((g) => g.semester))).sort()

    // Generate grade progression data for chart
    // Group by course and get assignment scores from assignments JSON
    const gradeProgressionData: Array<{
      course: string
      assignment1?: number
      assignment2?: number
      assignment3?: number
    }> = []

    // Group grades by course
    const gradesByCourse = new Map<string, typeof grades>()
    grades.forEach((grade) => {
      const courseCode = grade.course.courseCode
      if (!gradesByCourse.has(courseCode)) {
        gradesByCourse.set(courseCode, [])
      }
      gradesByCourse.get(courseCode)!.push(grade)
    })

    // Create progression data for each course
    gradesByCourse.forEach((courseGrades, courseCode) => {
      const progression: { course: string; assignment1?: number; assignment2?: number; assignment3?: number } = {
        course: courseCode,
      }

      // Try to extract assignment scores from assignments JSON
      courseGrades.forEach((grade, index) => {
        if (grade.assignments && typeof grade.assignments === 'object') {
          try {
            const assignments = grade.assignments as any
            // Check if assignments has scores array or individual assignment scores
            if (Array.isArray(assignments.scores)) {
              assignments.scores.slice(0, 3).forEach((score: number, i: number) => {
                if (i === 0) progression.assignment1 = score
                if (i === 1) progression.assignment2 = score
                if (i === 2) progression.assignment3 = score
              })
            } else if (assignments.assignment1 || assignments.assignment2 || assignments.assignment3) {
              progression.assignment1 = assignments.assignment1
              progression.assignment2 = assignments.assignment2
              progression.assignment3 = assignments.assignment3
            } else {
              // Use the grade score as a fallback, distributed across assignments
              const score = grade.score
              if (index === 0) progression.assignment1 = Math.max(0, score - 10)
              if (index === 1) progression.assignment2 = score
              if (index === 2) progression.assignment3 = Math.min(100, score + 5)
            }
          } catch (error) {
            console.error('[API] Error parsing assignments:', error)
          }
        } else {
          // Fallback: use grade scores as progression
          const score = grade.score
          if (index === 0) progression.assignment1 = Math.max(0, score - 10)
          if (index === 1) progression.assignment2 = score
          if (index === 2) progression.assignment3 = Math.min(100, score + 5)
        }
      })

      // Only add if we have at least one assignment score
      if (progression.assignment1 || progression.assignment2 || progression.assignment3) {
        gradeProgressionData.push(progression)
      }
    })

    return NextResponse.json({
      grades: formattedGrades,
      statistics: {
        average,
        creditsEarned,
        totalCreditsRequired: 60, // Default, can be updated from student record
        averageGrade,
      },
      semesters,
      gradeProgressionData,
    })
  } catch (error) {
    console.error('[API] Error fetching student grades:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

