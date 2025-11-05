import { NextResponse } from 'next/server'

/**
 * Test endpoint to verify the webhook route is accessible
 * This helps debug connection issues
 */
export async function GET() {
  return NextResponse.json({
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    env: {
      hasWebhookSecret: !!process.env.WEBHOOK_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    },
  })
}

export async function POST() {
  return NextResponse.json({
    message: 'POST endpoint is working',
    timestamp: new Date().toISOString(),
  })
}

