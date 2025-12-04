import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch all teachers
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

    // Fetch all users with role "teacher" and their Teacher records
    const usersWithTeacherRole = await prisma.user.findMany({
      where: {
        role: 'teacher',
        status: 'active', // Only fetch active users
      },
      include: {
        teacher: true, // Include Teacher record if it exists
      },
      orderBy: {
        lastName: 'asc',
      },
    })

    // Format teachers - create Teacher record if it doesn't exist
    const formattedTeachers = []
    
    for (const user of usersWithTeacherRole) {
      // If user doesn't have a Teacher record, create one
      let teacherRecord = user.teacher
      if (!teacherRecord) {
        try {
          // Check if a Teacher record already exists (race condition protection)
          teacherRecord = await prisma.teacher.findUnique({
            where: { userId: user.id },
          })
          
          if (!teacherRecord) {
            teacherRecord = await prisma.teacher.create({
              data: {
                userId: user.id,
                status: 'active',
              },
            })
            console.log(`[API] Created Teacher record for user: ${user.email}`)
          }
        } catch (error) {
          console.error(`[API] Error creating/fetching Teacher record for user ${user.email}:`, error)
          // Skip this user if we can't create/fetch their Teacher record
          continue
        }
      }

      // Only include teachers with active status (or if status is not set, default to active)
      if (teacherRecord.status === 'active' || !teacherRecord.status) {
        formattedTeachers.push({
          id: teacherRecord.id,
          teacherId: teacherRecord.teacherId,
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`.trim() || user.email,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          department: teacherRecord.department,
          rating: teacherRecord.rating,
          status: teacherRecord.status || 'active',
        })
      }
    }

    return NextResponse.json(formattedTeachers)
  } catch (error) {
    console.error('[API] Error fetching teachers:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

