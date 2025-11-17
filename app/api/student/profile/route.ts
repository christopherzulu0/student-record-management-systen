import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch student profile
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

    // Verify user is student
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { 
        id: true,
        role: true,
        firstName: true,
        lastName: true,
        email: true,
        dateOfBirth: true,
        gender: true,
        nationality: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        bio: true,
      },
    })

    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Forbidden - Student access required' },
        { status: 403 }
      )
    }

    // Get student record
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { 
        id: true,
        studentId: true,
        enrollmentDate: true,
        expectedGraduation: true,
        program: true,
        department: true,
        yearOfStudy: true,
        emergencyContactName: true,
        emergencyContactRelation: true,
        emergencyContactPhone: true,
        emergencyContactEmail: true,
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student record not found' },
        { status: 404 }
      )
    }

    // Format gender enum to string
    const genderMap: Record<string, string> = {
      'MALE': 'male',
      'FEMALE': 'female',
      'OTHER': 'other',
      'PREFER_NOT_TO_SAY': 'prefer-not-to-say',
    }

    return NextResponse.json({
      // Personal Information
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : '',
      gender: user.gender ? genderMap[user.gender] || user.gender.toLowerCase() : '',
      nationality: user.nationality || '',
      // Contact Information
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zipCode || '',
      country: user.country || '',
      // Academic Information
      studentId: student.studentId,
      enrollmentDate: student.enrollmentDate.toISOString().split('T')[0],
      program: student.program || '',
      yearOfStudy: student.yearOfStudy ? student.yearOfStudy.toString() : '',
      expectedGraduation: student.expectedGraduation ? student.expectedGraduation.toISOString().split('T')[0] : '',
      // Emergency Contact
      emergencyName: student.emergencyContactName || '',
      emergencyRelation: student.emergencyContactRelation || '',
      emergencyPhone: student.emergencyContactPhone || '',
      emergencyEmail: student.emergencyContactEmail || '',
      // Additional Information
      bio: user.bio || '',
    })
  } catch (error) {
    console.error('[API] Error fetching student profile:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Update student profile
export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user from Clerk session
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized - No user in session' },
        { status: 401 }
      )
    }

    // Verify user is student
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { 
        id: true,
        role: true,
      },
    })

    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Forbidden - Student access required' },
        { status: 403 }
      )
    }

    // Get student record
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student record not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Map gender string to enum
    const genderEnumMap: Record<string, 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'> = {
      'male': 'MALE',
      'female': 'FEMALE',
      'other': 'OTHER',
      'prefer-not-to-say': 'PREFER_NOT_TO_SAY',
    }

    // Update User model
    const userUpdateData: any = {
      firstName: body.firstName || undefined,
      lastName: body.lastName || undefined,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      gender: body.gender && genderEnumMap[body.gender] ? genderEnumMap[body.gender] : undefined,
      nationality: body.nationality || undefined,
      phone: body.phone || undefined,
      address: body.address || undefined,
      city: body.city || undefined,
      state: body.state || undefined,
      zipCode: body.zipCode || undefined,
      country: body.country || undefined,
      bio: body.bio || undefined,
    }

    // Remove undefined values
    Object.keys(userUpdateData).forEach(key => {
      if (userUpdateData[key] === undefined) {
        delete userUpdateData[key]
      }
    })

    // Update Student model
    const studentUpdateData: any = {
      program: body.program || undefined,
      yearOfStudy: body.yearOfStudy ? parseInt(body.yearOfStudy, 10) : undefined,
      expectedGraduation: body.expectedGraduation ? new Date(body.expectedGraduation) : undefined,
      emergencyContactName: body.emergencyName || undefined,
      emergencyContactRelation: body.emergencyRelation || undefined,
      emergencyContactPhone: body.emergencyPhone || undefined,
      emergencyContactEmail: body.emergencyEmail || undefined,
    }

    // Remove undefined values
    Object.keys(studentUpdateData).forEach(key => {
      if (studentUpdateData[key] === undefined) {
        delete studentUpdateData[key]
      }
    })

    // Update both User and Student in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: userUpdateData,
      }),
      prisma.student.update({
        where: { id: student.id },
        data: studentUpdateData,
      }),
    ])

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      success: true,
    })
  } catch (error) {
    console.error('[API] Error updating student profile:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

