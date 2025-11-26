import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch all recommendations for the authenticated student
export async function GET() {
    try {
        const clerkUser = await currentUser()

        if (!clerkUser) {
            return NextResponse.json(
                { error: 'Unauthorized - No user in session' },
                { status: 401 }
            )
        }

        // Get user and their student record
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUser.id },
            include: {
                student: true,
            },
        })

        if (!user || !user.student) {
            return NextResponse.json(
                { error: 'Student record not found' },
                { status: 404 }
            )
        }

        // Fetch recommendations with teacher and course information
        const recommendations = await prisma.recommendation.findMany({
            where: {
                studentId: user.student.id,
            },
            include: {
                teacher: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                course: {
                    select: {
                        courseCode: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                dateRequested: 'desc',
            },
        })

        // Format recommendations for frontend
        const formattedRecommendations = recommendations.map(rec => ({
            id: rec.id,
            teacherName: `${rec.teacher.user.firstName} ${rec.teacher.user.lastName || ''}`.trim(),
            teacherEmail: rec.teacher.user.email,
            courseCode: rec.courseCode || rec.course?.courseCode || 'N/A',
            courseName: rec.course?.name,
            purpose: rec.purpose,
            dateRequested: rec.dateRequested.toISOString(),
            deadline: rec.deadline?.toISOString(),
            status: rec.status,
            priority: rec.priority,
            submittedAt: rec.submittedAt?.toISOString(),
            fileUrl: rec.fileUrl,
            fileName: rec.fileName,
            createdAt: rec.createdAt.toISOString(),
        }))

        return NextResponse.json(formattedRecommendations)
    } catch (error) {
        console.error('[API] Error fetching recommendations:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}

// POST - Create a new recommendation request
export async function POST(request: Request) {
    try {
        const clerkUser = await currentUser()

        if (!clerkUser) {
            return NextResponse.json(
                { error: 'Unauthorized - No user in session' },
                { status: 401 }
            )
        }

        // Get user and their student record
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUser.id },
            include: {
                student: true,
            },
        })

        if (!user || !user.student) {
            return NextResponse.json(
                { error: 'Student record not found' },
                { status: 404 }
            )
        }

        // Parse request body
        const body = await request.json()
        const { teacherId, courseId, purpose, deadline, priority } = body

        // Validate required fields
        if (!teacherId) {
            return NextResponse.json(
                { error: 'Teacher ID is required' },
                { status: 400 }
            )
        }

        if (!purpose) {
            return NextResponse.json(
                { error: 'Purpose is required' },
                { status: 400 }
            )
        }

        // Verify teacher exists
        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
            include: {
                courses: {
                    where: courseId ? { id: courseId } : undefined,
                    select: {
                        courseCode: true,
                    },
                },
            },
        })

        if (!teacher) {
            return NextResponse.json(
                { error: 'Teacher not found' },
                { status: 404 }
            )
        }

        // Get course code if courseId provided
        let courseCode = null
        if (courseId) {
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                select: { courseCode: true },
            })
            courseCode = course?.courseCode
        }

        // Create recommendation request
        const recommendation = await prisma.recommendation.create({
            data: {
                studentId: user.student.id,
                teacherId: teacherId,
                courseId: courseId || null,
                courseCode: courseCode,
                purpose: purpose,
                deadline: deadline ? new Date(deadline) : null,
                priority: priority || 'medium',
                status: 'pending',
            },
            include: {
                teacher: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                course: {
                    select: {
                        courseCode: true,
                        name: true,
                    },
                },
            },
        })

        // Format response
        const formattedRecommendation = {
            id: recommendation.id,
            teacherName: `${recommendation.teacher.user.firstName} ${recommendation.teacher.user.lastName || ''}`.trim(),
            teacherEmail: recommendation.teacher.user.email,
            courseCode: recommendation.courseCode || recommendation.course?.courseCode || 'N/A',
            courseName: recommendation.course?.name,
            purpose: recommendation.purpose,
            dateRequested: recommendation.dateRequested.toISOString(),
            deadline: recommendation.deadline?.toISOString(),
            status: recommendation.status,
            priority: recommendation.priority,
            createdAt: recommendation.createdAt.toISOString(),
        }

        return NextResponse.json({
            success: true,
            message: 'Recommendation request created successfully',
            recommendation: formattedRecommendation,
        }, { status: 201 })
    } catch (error) {
        console.error('[API] Error creating recommendation:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
