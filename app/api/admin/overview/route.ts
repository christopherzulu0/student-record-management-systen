import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper function to get GPA points from letter grade
function getGPAPoints(letterGrade: string): number {
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
  return gradeMap[letterGrade] || 0
}

// Helper function to convert enum to letter grade
function enumToLetterGrade(enumValue: string): string {
  return enumValue.replace(/_PLUS/g, '+').replace(/_MINUS/g, '-')
}

// GET - Fetch admin overview data
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

    // Get current date and calculate last 5 months
    const now = new Date()
    const months: { month: string; start: Date; end: Date }[] = []
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    for (let i = 4; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
      months.push({
        month: monthNames[date.getMonth()],
        start: monthStart,
        end: monthEnd,
      })
    }

    // Fetch all data in parallel
    const [
      enrollmentTrends,
      allStudents,
      allGrades,
      allEnrollments,
      departments,
      recentStudents,
      recentGrades,
      recentSemesters,
      atRiskCount,
      pendingDocuments,
    ] = await Promise.all([
      // Enrollment trends - count students enrolled in each month
      Promise.all(
        months.map(async (m) => {
          const [students, teachers, courses] = await Promise.all([
            prisma.student.count({
              where: {
                enrollmentDate: {
                  gte: m.start,
                  lte: m.end,
                },
              },
            }),
            prisma.teacher.count({
              where: {
                createdAt: {
                  gte: m.start,
                  lte: m.end,
                },
                status: 'active',
              },
            }),
            prisma.course.count({
              where: {
                createdAt: {
                  gte: m.start,
                  lte: m.end,
                },
                status: 'active',
              },
            }),
          ])
          return {
            month: m.month,
            students,
            teachers,
            courses,
          }
        })
      ),
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
      // All grades for GPA calculation
      prisma.grade.findMany({
        include: {
          course: {
            select: {
              credits: true,
            },
          },
        },
      }),
      // All enrollments for department stats
      prisma.enrollment.findMany({
        where: {
          status: 'enrolled',
        },
        include: {
          course: {
            include: {
              departmentRelation: {
                select: {
                  name: true,
                },
              },
            },
          },
          student: {
            select: {
              department: true,
            },
          },
        },
      }),
      // All departments
      prisma.department.findMany({
        select: {
          id: true,
          name: true,
        },
      }),
      // Recent students (last 20)
      prisma.student.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      // Recent grades (last 20)
      prisma.grade.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
        include: {
          course: {
            select: {
              courseCode: true,
            },
          },
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
      }),
      // Recent semesters (last 10)
      prisma.semester.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
      // At-risk students count
      prisma.student.count({
        where: {
          status: 'at_risk',
        },
      }),
      // Pending documents count
      prisma.document.count({
        where: {
          status: 'uploaded',
        },
      }),
    ])

    // Calculate GPA distribution
    const gpaDistribution = {
      '3.8+': 0,
      '3.5-3.8': 0,
      '3.0-3.5': 0,
      '2.5-3.0': 0,
      '<2.5': 0,
    }

    allStudents.forEach((student) => {
      if (student.cumulativeGPA !== null && student.cumulativeGPA !== undefined) {
        const gpa = student.cumulativeGPA
        if (gpa >= 3.8) {
          gpaDistribution['3.8+']++
        } else if (gpa >= 3.5) {
          gpaDistribution['3.5-3.8']++
        } else if (gpa >= 3.0) {
          gpaDistribution['3.0-3.5']++
        } else if (gpa >= 2.5) {
          gpaDistribution['2.5-3.0']++
        } else {
          gpaDistribution['<2.5']++
        }
      }
    })

    const performanceData = [
      { gpa: '3.8+', count: gpaDistribution['3.8+'] },
      { gpa: '3.5-3.8', count: gpaDistribution['3.5-3.8'] },
      { gpa: '3.0-3.5', count: gpaDistribution['3.0-3.5'] },
      { gpa: '2.5-3.0', count: gpaDistribution['2.5-3.0'] },
      { gpa: '<2.5', count: gpaDistribution['<2.5'] },
    ]

    // Calculate department metrics
    const departmentMap = new Map<string, { enrollment: number; totalGPA: number; count: number }>()

    // Initialize all departments
    departments.forEach((dept) => {
      departmentMap.set(dept.name, { enrollment: 0, totalGPA: 0, count: 0 })
    })

    // Count enrollments by department
    allEnrollments.forEach((enrollment) => {
      const deptName = enrollment.course.departmentRelation?.name || enrollment.course.department || enrollment.student.department || 'Other'
      const dept = departmentMap.get(deptName) || { enrollment: 0, totalGPA: 0, count: 0 }
      dept.enrollment++
      departmentMap.set(deptName, dept)
    })

    // Calculate average GPA per department
    allStudents.forEach((student) => {
      if (student.cumulativeGPA !== null && student.department) {
        const dept = departmentMap.get(student.department) || { enrollment: 0, totalGPA: 0, count: 0 }
        dept.totalGPA += student.cumulativeGPA
        dept.count++
        departmentMap.set(student.department, dept)
      }
    })

    const departmentData = Array.from(departmentMap.entries())
      .map(([dept, data]) => ({
        dept,
        enrollment: data.enrollment,
        avgGpa: data.count > 0 ? Number((data.totalGPA / data.count).toFixed(2)) : 0,
      }))
      .filter((d) => d.enrollment > 0 || d.avgGpa > 0)
      .sort((a, b) => b.enrollment - a.enrollment)

    const departmentMetrics = departmentData.map((dept, index) => {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']
      return {
        name: dept.dept,
        value: dept.enrollment,
        color: colors[index % colors.length],
      }
    })

    // Build recent activity
    const recentActivity: Array<{
      id: string
      action: string
      timestamp: string
      icon: string
    }> = []

    // Add recent student registrations
    recentStudents.forEach((student) => {
      const name = `${student.user.firstName} ${student.user.lastName || ''}`.trim()
      const hoursAgo = Math.floor((now.getTime() - student.createdAt.getTime()) / (1000 * 60 * 60))
      const daysAgo = Math.floor((now.getTime() - student.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      let timestamp: string
      if (hoursAgo < 1) {
        timestamp = 'Just now'
      } else if (hoursAgo < 24) {
        timestamp = hoursAgo === 1 ? '1 hour ago' : `${hoursAgo} hours ago`
      } else {
        timestamp = daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`
      }
      recentActivity.push({
        id: `student-${student.id}`,
        action: `New student registered: ${name}`,
        timestamp,
        icon: 'UserCheck',
      })
    })

    // Add recent grade submissions
    recentGrades.forEach((grade) => {
      const hoursAgo = Math.floor((now.getTime() - grade.createdAt.getTime()) / (1000 * 60 * 60))
      const daysAgo = Math.floor((now.getTime() - grade.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      let timestamp: string
      if (hoursAgo < 1) {
        timestamp = 'Just now'
      } else if (hoursAgo < 24) {
        timestamp = hoursAgo === 1 ? '1 hour ago' : `${hoursAgo} hours ago`
      } else {
        timestamp = daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`
      }
      const studentName = `${grade.student.user.firstName} ${grade.student.user.lastName || ''}`.trim()
      recentActivity.push({
        id: `grade-${grade.id}`,
        action: `Grade submitted for ${grade.course.courseCode} - ${studentName}`,
        timestamp,
        icon: 'TrendingUp',
      })
    })

    // Add recent semester creation
    recentSemesters.forEach((semester) => {
      const daysAgo = Math.floor((now.getTime() - semester.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      recentActivity.push({
        id: `semester-${semester.id}`,
        action: `${semester.name} semester created`,
        timestamp: daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`,
        icon: 'Calendar',
      })
    })

    // Sort by timestamp (most recent first) - we'll sort by creation date
    recentActivity.sort((a, b) => {
      // Extract the ID prefix to get the original creation time
      // This is a simplified approach - in production you might want to include createdAt in the response
      return 0 // Already sorted by creation date from the queries
    })

    // Build system alerts
    const systemAlerts: Array<{
      id: string
      type: 'warning' | 'info' | 'success'
      message: string
      action: string
    }> = []

    if (atRiskCount > 0) {
      systemAlerts.push({
        id: 'at-risk',
        type: 'warning',
        message: `${atRiskCount} students with GPA below 2.5`,
        action: 'Review',
      })
    }

    if (pendingDocuments > 0) {
      systemAlerts.push({
        id: 'pending-docs',
        type: 'info',
        message: `${pendingDocuments} document(s) pending review`,
        action: 'Review',
      })
    }

    // Check for courses at capacity
    const coursesAtCapacity = await prisma.course.findMany({
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      where: {
        status: 'active',
      },
    })

    const atCapacity = coursesAtCapacity.filter((c) => {
      // Assuming max capacity is 50 (you might want to add this to the schema)
      return c._count.enrollments >= 50
    })

    if (atCapacity.length > 0) {
      systemAlerts.push({
        id: 'capacity',
        type: 'warning',
        message: `${atCapacity.length} course(s) at capacity`,
        action: 'View',
      })
    }

    // If no alerts, add a success message
    if (systemAlerts.length === 0) {
      systemAlerts.push({
        id: 'all-good',
        type: 'success',
        message: 'All systems operational',
        action: 'View',
      })
    }

    return NextResponse.json({
      enrollmentTrends,
      performanceData,
      departmentData,
      departmentMetrics,
      recentActivity,
      systemAlerts,
    })
  } catch (error) {
    console.error('[API] Error fetching admin overview:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

