import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch all users for admin
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

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Format users data
    const formattedUsers = users.map((user) => {
      // Generate display ID based on role
      // Use first 8 characters of the ID, or pad if shorter
      const idSuffix = user.id.length >= 8 ? user.id.slice(0, 8).toUpperCase() : user.id.toUpperCase().padEnd(8, '0')
      let displayId = idSuffix
      if (user.role === 'student') {
        displayId = `STU-${idSuffix}`
      } else if (user.role === 'teacher') {
        displayId = `TCH-${idSuffix}`
      } else if (user.role === 'admin') {
        displayId = `ADM-${idSuffix}`
      } else {
        displayId = `USR-${idSuffix}`
      }

      return {
        id: displayId,
        userId: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email,
        role: user.role,
        status: user.status || 'active',
        createdAt: user.createdAt.toISOString(),
      }
    })

    // Calculate statistics
    const total = formattedUsers.length
    const students = formattedUsers.filter((u) => u.role === 'student').length
    const teachers = formattedUsers.filter((u) => u.role === 'teacher').length
    const admins = formattedUsers.filter((u) => u.role === 'admin').length

    return NextResponse.json({
      users: formattedUsers,
      statistics: {
        total,
        students,
        teachers,
        admins,
      },
    })
  } catch (error) {
    console.error('[API] Error fetching admin users:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

