import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - Submit or update a teacher rating
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const { teacherId } = await params
    
    // Get authenticated user from Clerk session
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized - No user in session' },
        { status: 401 }
      )
    }

    // Verify user exists and is a student
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { 
        id: true,
        role: true,
        student: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Forbidden - Student access required' },
        { status: 403 }
      )
    }

    if (!user.student) {
      return NextResponse.json(
        { error: 'Student record not found' },
        { status: 404 }
      )
    }


    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { id: true },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      )
    }


    // Check if student has enrolled in any course with this teacher
    const hasEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: user.student.id,
        course: {
          teacherId: teacher.id,
        },
        status: 'enrolled',
      },
    })

    if (!hasEnrollment) {
      return NextResponse.json(
        { error: 'You can only rate teachers whose courses you are enrolled in' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { rating, comment } = body

    // Validate rating
    if (rating === undefined || rating === null || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Use upsert to create or update rating
    const teacherRating = await prisma.teacherRating.upsert({
      where: {
        studentId_teacherId: {
          studentId: user.student.id,
          teacherId: teacher.id,
        },
      },
      update: {
        rating: Number(rating),
        comment: comment || null,
      },
      create: {
        studentId: user.student.id,
        teacherId: teacher.id,
        rating: Number(rating),
        comment: comment || null,
      },
    })

    // Calculate new average rating for the teacher
    const allRatings = await prisma.teacherRating.findMany({
      where: { teacherId: teacher.id },
      select: { rating: true },
    })

    const averageRating =
      allRatings.length > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        : 0

    // Update teacher's average rating
    await prisma.teacher.update({
      where: { id: teacher.id },
      data: { rating: Number(averageRating.toFixed(2)) },
    })

    return NextResponse.json({
      success: true,
      rating: teacherRating.rating,
      averageRating: Number(averageRating.toFixed(2)),
    })
  } catch (error) {
    console.error('[API] Error submitting teacher rating:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET - Get student's rating for a teacher
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const { teacherId } = await params
    
    // Get authenticated user from Clerk session
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized - No user in session' },
        { status: 401 }
      )
    }

    // Verify user exists and is a student
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { 
        id: true,
        role: true,
        student: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!user || user.role !== 'student' || !user.student) {
      return NextResponse.json(
        { error: 'Forbidden - Student access required' },
        { status: 403 }
      )
    }

    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { id: true },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Get student's rating for this teacher
    const teacherRating = await prisma.teacherRating.findUnique({
      where: {
        studentId_teacherId: {
          studentId: user.student.id,
          teacherId: teacherId,
        },
      },
      select: {
        rating: true,
        comment: true,
      },
    })

    return NextResponse.json({
      rating: teacherRating?.rating || null,
      comment: teacherRating?.comment || null,
    })
  } catch (error) {
    console.error('[API] Error fetching teacher rating:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

