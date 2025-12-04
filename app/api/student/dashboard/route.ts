import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper function to get GPA points from letter grade
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

// Helper function to get letter grade from score
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

// GET - Fetch student dashboard data
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

    // Fetch enrollments with courses and semesters
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

    // Fetch all grades
    const grades = await prisma.grade.findMany({
      where: {
        studentId: student.id,
      },
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
            startDate: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Calculate course grades with targets
    const courseGrades = enrollments.map((enrollment) => {
      const grade = grades.find(
        (g) => g.courseId === enrollment.courseId && g.semesterId === enrollment.semesterId
      )
      const score = grade?.score || 0
      const letterGrade = grade?.letterGrade 
        ? grade.letterGrade.replace(/_PLUS/g, '+').replace(/_MINUS/g, '-')
        : score > 0 ? getLetterGrade(score) : null
      
      return {
        name: enrollment.course.courseCode,
        grade: Math.round(score),
        target: 85, // Default target, can be customized
        trend: grade?.trend === 'up' ? 'up' : grade?.trend === 'down' ? 'down' : 'stable',
      }
    })

    // Calculate GPA history by semester
    const semesterGPAs: Array<{ semester: string; gpa: number; courses: number }> = []
    const gradesBySemester = new Map<string, typeof grades>()
    
    grades.forEach((grade) => {
      const semesterName = grade.semester.name
      if (!gradesBySemester.has(semesterName)) {
        gradesBySemester.set(semesterName, [])
      }
      gradesBySemester.get(semesterName)!.push(grade)
    })

    gradesBySemester.forEach((semesterGrades, semesterName) => {
      let totalPoints = 0
      let totalCredits = 0
      
      semesterGrades.forEach((grade) => {
        const enrollment = enrollments.find(
          (e) => e.courseId === grade.courseId && e.semesterId === grade.semesterId
        )
        if (enrollment) {
          const letterGrade = grade.letterGrade 
            ? grade.letterGrade.replace(/_PLUS/g, '+').replace(/_MINUS/g, '-')
            : getLetterGrade(grade.score)
          const gpaPoints = getGPAPoints(letterGrade)
          totalPoints += gpaPoints * enrollment.course.credits
          totalCredits += enrollment.course.credits
        }
      })

      if (totalCredits > 0) {
        semesterGPAs.push({
          semester: semesterName,
          gpa: Number((totalPoints / totalCredits).toFixed(2)),
          courses: semesterGrades.length,
        })
      }
    })

    // Sort GPA history by semester start date
    semesterGPAs.sort((a, b) => {
      const aEnrollment = enrollments.find((e) => e.semester.name === a.semester)
      const bEnrollment = enrollments.find((e) => e.semester.name === b.semester)
      const aSemester = aEnrollment?.semester.startDate
      const bSemester = bEnrollment?.semester.startDate
      if (!aSemester || !bSemester) return 0
      return aSemester.getTime() - bSemester.getTime()
    })

    // Calculate credit progress - same logic as grades API
    // Calculate credits earned from passed courses (not F)
    let creditsEarned = 0
    grades.forEach((grade) => {
      const enrollment = enrollments.find(
        (e) => e.courseId === grade.courseId && e.semesterId === grade.semesterId
      )
      if (enrollment) {
        const letterGrade = grade.letterGrade 
          ? grade.letterGrade.replace(/_PLUS/g, '+').replace(/_MINUS/g, '-')
          : getLetterGrade(grade.score)
        // Only count credits if grade is not F
        if (letterGrade !== 'F') {
          creditsEarned += enrollment.course.credits
        }
      }
    })
    
    // Fallback to database value if no grades exist yet
    const creditsCompleted = creditsEarned > 0 ? creditsEarned : (student.totalCreditsEarned || 0)
    
    const creditsInProgress = enrollments
      .filter((e) => !grades.find((g) => g.courseId === e.courseId && g.semesterId === e.semesterId))
      .reduce((sum, e) => sum + e.course.credits, 0)
    const creditsRemaining = Math.max(0, (student.totalCreditsRequired || 60) - creditsCompleted - creditsInProgress)

    // Calculate average course grade
    const gradesWithScores = courseGrades.filter((g) => g.grade > 0)
    const avgCourseGrade = gradesWithScores.length > 0
      ? Number((gradesWithScores.reduce((sum, g) => sum + g.grade, 0) / gradesWithScores.length).toFixed(1))
      : 0

    // Calculate class rank (placeholder - would need all students' GPAs)
    const classRank = 8
    const totalStudents = 120

    // Calculate completion percentage
    const totalAssignments = grades.length
    const completedAssignments = grades.filter((g) => g.score >= 70).length
    const completionPercentage = totalAssignments > 0 
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 100

    // Generate performance data (using recent grades with course names)
    const recentGrades = grades.slice(0, 5)
    const performanceData = recentGrades.map((grade) => ({
      name: grade.course.courseCode || grade.course.name || 'Unknown Course',
      score: Math.round(grade.score),
      class_avg: Math.round(grade.score * 0.92), // Placeholder - would need actual class average
    }))

    // Generate academic alerts
    const alerts: Array<{ id: number; type: string; message: string }> = []
    
    if (student.cumulativeGPA && student.cumulativeGPA >= 3.8) {
      alerts.push({
        id: 1,
        type: 'info',
        message: "You qualify for Dean's List this semester!",
      })
    }

    const excellentCourses = courseGrades.filter((g) => g.grade >= 90)
    if (excellentCourses.length > 0) {
      alerts.push({
        id: 2,
        type: 'success',
        message: `Excellent performance in ${excellentCourses[0].name}! Keep it up.`,
      })
    }

    const decliningCourses = courseGrades.filter((g) => g.trend === 'down' && g.grade < 80)
    if (decliningCourses.length > 0) {
      alerts.push({
        id: 3,
        type: 'warning',
        message: `${decliningCourses[0].name} grade trending down, consider tutoring.`,
      })
    }

    return NextResponse.json({
      // User info
      name: `${user.firstName} ${user.lastName || ''}`.trim() || 'Student',
      studentId: student.studentId,
      
      // Statistics
      currentGPA: student.cumulativeGPA || 0,
      creditsEarned: creditsCompleted,
      creditsInProgress: creditsInProgress,
      creditsRemaining: creditsRemaining,
      totalCreditsRequired: student.totalCreditsRequired || 60,
      courseAverage: avgCourseGrade,
      classRank: classRank,
      totalStudents: totalStudents,
      completionPercentage: completionPercentage,
      
      // Charts data
      courseGrades: courseGrades,
      gpaHistory: semesterGPAs,
      creditData: [
        { name: 'Completed', value: creditsCompleted, fill: '#3b82f6' },
        { name: 'In Progress', value: creditsInProgress, fill: '#10b981' },
        { name: 'Remaining', value: creditsRemaining, fill: '#f3f4f6' },
      ],
      performanceData: performanceData,
      
      // Alerts
      academicAlerts: alerts,
      
      // Placeholder data (would need additional endpoints)
      upcomingAssignments: [],
      schedule: [],
      documents: [],
    })
  } catch (error) {
    console.error('[API] Error fetching student dashboard:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

