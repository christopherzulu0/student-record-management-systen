import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - Submit a recommendation letter
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params in Next.js 15+
        const { id } = await params

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

        // Parse request body
        const body = await request.json()
        const { letterText, fileUrl, fileName } = body

        if ((!letterText || !letterText.trim()) && !fileUrl) {
            return NextResponse.json(
                { error: 'Either letter content or a file upload is required' },
                { status: 400 }
            )
        }

        // Verify recommendation exists and belongs to this teacher
        const recommendation = await prisma.recommendation.findUnique({
            where: { id },
        })

        if (!recommendation) {
            return NextResponse.json(
                { error: 'Recommendation not found' },
                { status: 404 }
            )
        }

        if (recommendation.teacherId !== user.teacher.id) {
            return NextResponse.json(
                { error: 'Forbidden - This recommendation does not belong to you' },
                { status: 403 }
            )
        }

        // Update recommendation with letter text/file and mark as submitted
        const updatedRecommendation = await prisma.recommendation.update({
            where: { id },
            data: {
                letterText: letterText?.trim(),
                fileUrl,
                fileName,
                status: 'submitted',
                submittedAt: new Date(),
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Recommendation letter submitted successfully',
            recommendation: {
                id: updatedRecommendation.id,
                status: updatedRecommendation.status,
                submittedAt: updatedRecommendation.submittedAt?.toISOString(),
            },
        })
    } catch (error) {
        console.error('[API] Error submitting recommendation:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
