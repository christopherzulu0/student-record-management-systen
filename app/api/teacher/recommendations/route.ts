import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch all recommendation requests for the authenticated teacher
export async function GET() {
    try {
        const clerkUser = await currentUser()

        if (!clerkUser) {
            return NextResponse.json(
                { error: 'Unauthorized - No user in session' },
                { status: 401 }
            )
        }

        // Get user and their teacher record
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUser.id },
            include: {
                teacher: true,
            },
        })

        if (!user || !user.teacher) {
            return NextResponse.json(
                { error: 'Teacher record not found' },
                { status: 404 }
            )
        }

        // Fetch recommendations with student and course information
        const recommendations = await prisma.recommendation.findMany({
            where: {
                teacherId: user.teacher.id,
            },
            include: {
                student: {
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
            orderBy: [
                { deadline: 'asc' }, // Urgent first
                { dateRequested: 'desc' },
            ],
        })

        // Calculate days left and format recommendations
        const formattedRecommendations = recommendations.map(rec => {
            const now = new Date()
            const deadline = rec.deadline ? new Date(rec.deadline) : null
            let daysLeft = 0

            if (deadline) {
                const diffTime = deadline.getTime() - now.getTime()
                daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            }

            return {
                id: rec.id,
                studentName: `${rec.student.user.firstName} ${rec.student.user.lastName || ''}`.trim(),
                studentId: rec.student.studentId,
                studentEmail: rec.student.user.email,
                courseCode: rec.courseCode || rec.course?.courseCode || 'N/A',
                courseName: rec.course?.name,
                purpose: rec.purpose,
                dateRequested: rec.dateRequested.toISOString(),
                deadline: rec.deadline?.toISOString(),
                daysLeft: daysLeft,
                status: rec.status,
                priority: rec.priority,
                letterText: rec.letterText,
                submittedAt: rec.submittedAt?.toISOString(),
                createdAt: rec.createdAt.toISOString(),
            }
        })

        return NextResponse.json(formattedRecommendations)
    } catch (error) {
        console.error('[API] Error fetching teacher recommendations:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
