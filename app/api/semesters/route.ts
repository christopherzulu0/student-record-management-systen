import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - Create a new semester
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Clerk session
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized - No user in session' },
        { status: 401 }
      )
    }

    // Check if user is admin
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

    const body = await request.json()
    const { name, startDate, endDate, isActive } = body

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Semester name, start date, and end date are required' },
        { status: 400 }
      )
    }

    // Validate date format
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Validate that end date is after start date
    if (end <= start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Check if semester name already exists
    const existingSemester = await prisma.semester.findUnique({
      where: { name },
      select: {
        name: true,
        id: true,
      },
    })

    if (existingSemester) {
      return NextResponse.json(
        {
          error: `Semester "${name}" already exists`,
          details: `A semester with name "${name}" already exists in the system.`,
          existingSemester: {
            id: existingSemester.id,
            name: existingSemester.name,
          },
        },
        { status: 409 }
      )
    }

    // If this semester is being set as active, deactivate all other semesters
    if (isActive) {
      await prisma.semester.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      })
    }

    // Create semester
    const semester = await prisma.semester.create({
      data: {
        name,
        startDate: start,
        endDate: end,
        isActive: isActive || false,
      },
    })

    return NextResponse.json(semester, { status: 201 })
  } catch (error) {
    console.error('[API] Error creating semester:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET - Fetch all semesters
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

    // Fetch all semesters
    const semesters = await prisma.semester.findMany({
      orderBy: [
        { startDate: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(semesters)
  } catch (error) {
    console.error('[API] Error fetching semesters:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

