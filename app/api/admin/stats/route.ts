import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch admin dashboard statistics
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

    // Fetch statistics in parallel
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      allGrades,
      atRiskStudents,
      studentsThisMonth,
    ] = await Promise.all([
      // Total students count from User model where role is 'student'
      prisma.user.count({
        where: {
          role: 'student',
        },
      }),
      // Total active teachers count
      prisma.teacher.count({
        where: {
          status: 'active',
        },
      }),
      // Total active courses count
      prisma.course.count({
        where: {
          status: 'active',
        },
      }),
      // All grades for average calculation (simple average of scores)
      prisma.grade.findMany({
        select: {
          score: true,
        },
      }),
      // At risk students count
      prisma.student.count({
        where: {
          status: 'at_risk',
        },
      }),
      // Students enrolled this month
      prisma.student.count({
        where: {
          enrollmentDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ])

    // Calculate average from all grades (simple average: sum of scores / number of grades)
    const scores = allGrades
      .map((g) => g.score)
      .filter((score): score is number => score !== null && !isNaN(score))

    const averageAverage =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalCourses,
      averageAverage: Math.round(averageAverage * 100) / 100, // Round to 2 decimal places
      atRiskStudents,
      studentsAddedThisMonth: studentsThisMonth,
    })
  } catch (error) {
    console.error('[API] Error fetching admin stats:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

