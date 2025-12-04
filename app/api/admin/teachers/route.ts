import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch all teachers for admin
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

    // Fetch all teachers with their user information and courses
    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        courses: {
          where: {
            status: 'active',
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        teacherId: 'asc',
      },
    })

    // Format teachers data
    const formattedTeachers = teachers.map((teacher) => {
      // Map status enum to string
      const statusMap: Record<string, string> = {
        'active': 'active',
        'on_leave': 'on-leave',
        'inactive': 'inactive',
      }

      return {
        id: teacher.teacherId || `T-${teacher.id.slice(0, 8).toUpperCase()}`,
        teacherModelId: teacher.id,
        name: `${teacher.user.firstName} ${teacher.user.lastName || ''}`.trim() || teacher.user.email,
        email: teacher.user.email,
        department: teacher.department || 'General',
        courses: teacher.courses.length,
        status: statusMap[teacher.status] || 'active',
        rating: teacher.rating || 0,
      }
    })

    // Calculate statistics
    const total = formattedTeachers.length
    const active = formattedTeachers.filter((t) => t.status === 'active').length
    const teachersWithRating = formattedTeachers.filter((t) => t.rating > 0)
    const avgRating =
      teachersWithRating.length > 0
        ? teachersWithRating.reduce((sum, t) => sum + t.rating, 0) / teachersWithRating.length
        : 0
    const totalCourses = formattedTeachers.reduce((sum, t) => sum + t.courses, 0)

    // Get unique departments
    const departments = [...new Set(formattedTeachers.map((t) => t.department).filter(Boolean))]

    return NextResponse.json({
      teachers: formattedTeachers,
      statistics: {
        total,
        active,
        avgRating: Number(avgRating.toFixed(1)),
        totalCourses,
      },
      departments,
    })
  } catch (error) {
    console.error('[API] Error fetching admin teachers:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

