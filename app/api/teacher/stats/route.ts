import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch teacher dashboard statistics
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
    })

    const courseIds = courses.map(c => c.id)

    // Fetch statistics in parallel
    const [
      uniqueStudents,
      activeCourses,
      allGrades,
      atRiskStudentsList,
      pendingRecommendations,
      recentGradesData,
      atRiskStudentsData,
      enrollments,
    ] = await Promise.all([
      // Total students enrolled in teacher's courses (distinct)
      prisma.enrollment.findMany({
        where: {
          courseId: { in: courseIds },
          status: 'enrolled',
        },
        select: {
          studentId: true,
        },
        distinct: ['studentId'],
      }),
      // Active courses count
      prisma.course.count({
        where: {
          teacherId: teacher.id,
          status: 'active',
        },
      }),
      // All grades for average calculation
      prisma.grade.findMany({
        where: {
          courseId: { in: courseIds },
          teacherId: teacher.id,
        },
        select: {
          score: true,
        },
      }),
      // At risk students list (grades < 70)
      prisma.grade.findMany({
        where: {
          courseId: { in: courseIds },
          teacherId: teacher.id,
          score: { lt: 70 },
        },
        select: {
          studentId: true,
        },
        distinct: ['studentId'],
      }),
      // Pending recommendation requests
      prisma.recommendation.count({
        where: {
          teacherId: teacher.id,
          status: 'pending',
        },
      }),
      // Recent grades (last 10)
      prisma.grade.findMany({
        where: {
          courseId: { in: courseIds },
          teacherId: teacher.id,
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          course: {
            select: {
              courseCode: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
      // At risk students details
      prisma.grade.findMany({
        where: {
          courseId: { in: courseIds },
          teacherId: teacher.id,
          score: { lt: 70 },
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          course: {
            select: {
              courseCode: true,
            },
          },
        },
        orderBy: {
          score: 'asc',
        },
        take: 10,
        distinct: ['studentId'],
      }),
      // Enrollments for class data
      prisma.enrollment.findMany({
        where: {
          courseId: { in: courseIds },
          status: 'enrolled',
        },
        include: {
          course: {
            select: {
              courseCode: true,
              name: true,
            },
          },
        },
      }),
    ])

    // Calculate class average
    const classAverage = allGrades.length > 0
      ? allGrades.reduce((sum, grade) => sum + grade.score, 0) / allGrades.length
      : 0

    // Format class data
    const classDataMap = new Map()
    courses.forEach(course => {
      const courseEnrollments = enrollments.filter(e => e.courseId === course.id)
      const courseGrades = allGrades.filter(g => 
        enrollments.some(e => e.courseId === course.id && e.studentId === g.studentId)
      )
      const avgGrade = courseGrades.length > 0
        ? courseGrades.reduce((sum, g) => sum + g.score, 0) / courseGrades.length
        : 0

      classDataMap.set(course.id, {
        name: course.courseCode,
        students: courseEnrollments.length,
        avgGrade: Math.round(avgGrade * 10) / 10,
        attendance: 92, // Placeholder - would need attendance data
        trend: 'up', // Placeholder - would need trend calculation
      })
    })

    const classData = Array.from(classDataMap.values())

    // Format recent grades
    const recentGrades = recentGradesData.map(grade => ({
      student: `${grade.student.user.firstName} ${grade.student.user.lastName}`,
      course: grade.course.courseCode,
      grade: Math.round(grade.score),
      date: formatDate(grade.createdAt),
      status: grade.score >= 90 ? 'Excellent' : grade.score >= 80 ? 'Good' : 'Fair',
    }))

    // Format at-risk students
    const atRiskStudents = atRiskStudentsData.map(grade => ({
      name: `${grade.student.user.firstName} ${grade.student.user.lastName}`,
      course: grade.course.courseCode,
      grade: Math.round(grade.score),
      status: grade.score < 60 ? 'At Risk' : 'Needs Attention',
      trend: 'down',
    }))

    // Fetch pending recommendations
    const pendingRecommendationsData = await prisma.recommendation.findMany({
      where: {
        teacherId: teacher.id,
        status: 'pending',
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: [
        { priority: 'asc' },
        { dateRequested: 'asc' },
      ],
      take: 10,
    })

    const pendingLetters = pendingRecommendationsData.map(rec => {
      const daysRemaining = rec.deadline
        ? Math.ceil((rec.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null
      
      return {
        id: rec.id,
        student: `${rec.student.user.firstName} ${rec.student.user.lastName}`,
        requestDate: formatDate(rec.dateRequested),
        purpose: rec.purpose,
        priority: rec.priority,
        days: daysRemaining !== null ? Math.max(0, daysRemaining) : null,
      }
    })

    // Calculate grade distribution
    const gradeDistribution = [
      { range: 'A (90+)', count: allGrades.filter(g => g.score >= 90).length, fill: '#10b981' },
      { range: 'B (80-89)', count: allGrades.filter(g => g.score >= 80 && g.score < 90).length, fill: '#3b82f6' },
      { range: 'C (70-79)', count: allGrades.filter(g => g.score >= 70 && g.score < 80).length, fill: '#f59e0b' },
      { range: 'D (60-69)', count: allGrades.filter(g => g.score >= 60 && g.score < 70).length, fill: '#ef4444' },
    ]

    // Calculate performance trend (last 6 weeks with actual dates)
    const sixWeeksAgo = new Date()
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42)
    
    const weeklyGrades = await prisma.grade.findMany({
      where: {
        courseId: { in: courseIds },
        teacherId: teacher.id,
        createdAt: { gte: sixWeeksAgo },
      },
      select: {
        score: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Get overall average for fallback
    const overallAvg = allGrades.length > 0
      ? allGrades.reduce((sum, g) => sum + g.score, 0) / allGrades.length
      : 0

    const performanceTrend = []
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i * 7))
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const weekGrades = weeklyGrades.filter(g => {
        const gradeDate = new Date(g.createdAt)
        return gradeDate >= weekStart && gradeDate < weekEnd
      })

      const avg = weekGrades.length > 0
        ? weekGrades.reduce((sum, g) => sum + g.score, 0) / weekGrades.length
        : overallAvg // Use overall average if no grades in this week

      // Format week label with date range
      const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const weekEndLabel = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

      performanceTrend.push({
        week: `${weekLabel}-${weekEndLabel}`,
        avg: Math.round(avg * 10) / 10,
        submissions: weekGrades.length,
      })
    }

    // Calculate class metrics
    const totalStudents = uniqueStudents.length
    const atRiskCount = atRiskStudentsList.length

    const studentsThisMonth = await prisma.enrollment.findMany({
      where: {
        courseId: { in: courseIds },
        enrollmentDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      select: {
        studentId: true,
      },
      distinct: ['studentId'],
    })

    const classMetrics = [
      { label: 'Students', value: totalStudents, change: `+${studentsThisMonth.length} this month` },
      { label: 'Avg Engagement', value: '89%', change: '+5%' }, // Placeholder
      { label: 'Assignment Rate', value: '96%', change: '+2%' }, // Placeholder
    ]

    return NextResponse.json({
      totalStudents,
      activeCourses,
      classAverage: Math.round(classAverage * 10) / 10,
      pendingLettersCount: pendingLetters.length,
      atRisk: atRiskCount,
      classData,
      gradeDistribution,
      performanceTrend,
      recentGrades,
      atRiskStudents,
      pendingLetters,
      classMetrics,
    })
  } catch (error) {
    console.error('[API] Error fetching teacher stats:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

function formatDate(date: Date): string {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

