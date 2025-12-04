import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

    // Fetch user from database using Clerk ID - role comes from users table
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true, // Role fetched from database users table
        status: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { 
          error: 'User not found in database',
          hint: 'User may need to be synced. Check if webhook is configured correctly.'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim() || user.email,
      role: user.role, // Role from database users table
      status: user.status,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error('[API] Error fetching user:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST method also uses Clerk session
export async function POST() {
  // Same logic as GET - use Clerk session
  return GET()
}

