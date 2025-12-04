import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch all students for admin
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

    // Fetch all students with their user information
    const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        studentId: 'asc',
      },
    })

    // Format students data
    const formattedStudents = students.map((student) => {
      // Map status enum to string
      const statusMap: Record<string, string> = {
        'active': 'active',
        'at_risk': 'at-risk',
        'suspended': 'suspended',
        'inactive': 'inactive',
      }

      return {
        id: student.studentId,
        studentModelId: student.id,
        name: `${student.user.firstName} ${student.user.lastName || ''}`.trim() || student.user.email,
        email: student.user.email,
        gpa: student.cumulativeGPA || 0,
        enrolled: student.enrollmentDate.toISOString(),
        status: statusMap[student.status] || 'active',
        credits: student.totalCreditsEarned || 0,
      }
    })

    // Calculate statistics
    const total = formattedStudents.length
    const active = formattedStudents.filter((s) => s.status === 'active').length
    const atRisk = formattedStudents.filter((s) => s.status === 'at-risk').length
    const studentsWithGPA = formattedStudents.filter((s) => s.gpa > 0)
    const avgGPA =
      studentsWithGPA.length > 0
        ? studentsWithGPA.reduce((sum, s) => sum + s.gpa, 0) / studentsWithGPA.length
        : 0

    return NextResponse.json({
      students: formattedStudents,
      statistics: {
        total,
        active,
        atRisk,
        avgGPA: Number(avgGPA.toFixed(2)),
      },
    })
  } catch (error) {
    console.error('[API] Error fetching admin students:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

