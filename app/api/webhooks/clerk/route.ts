import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { PrismaClient } from '@/app/generated/prisma/client'
import { clerkClient } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

// Helper function to create or update user in database
async function ensureUserExists(clerkUserId: string, email: string, firstName?: string, lastName?: string, phone?: string, role?: string) {
  try {
    // Check if user already exists by clerkId first
    let existingUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    })

    // If not found by clerkId, check by email
    if (!existingUser) {
      existingUser = await prisma.user.findUnique({
        where: { email },
      })
    }

    if (!existingUser) {
      // Determine role from metadata or default to student
      const userRole = role || 'student'

      // Create new user with clerkId
      const newUser = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email,
          firstName: firstName || '',
          lastName: lastName || '',
          phone: phone || null,
          role: userRole === 'admin' ? 'admin' : userRole === 'teacher' ? 'teacher' : 'student',
          status: 'active',
          // Required emergency contact fields
          EmergencyContactName: '',
          EmergencyContactNumber: '',
        },
      })

      console.log(`[WEBHOOK] User created in database: ${email} with clerkId: ${clerkUserId}`)
      return newUser
    } else {
      // Update clerkId if it's missing (for users created before webhook was set up)
      if (!existingUser.clerkId) {
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: { clerkId: clerkUserId },
        })
        console.log(`[WEBHOOK] Updated user clerkId: ${email}`)
        return updatedUser
      }
      console.log(`[WEBHOOK] User already exists in database: ${email}`)
      return existingUser
    }
  } catch (error) {
    console.error('[WEBHOOK] Error ensuring user exists:', error)
    throw error
  }
}

// Disable body parsing for webhook verification
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const startTime = Date.now()
  console.log('[WEBHOOK] Request received at:', new Date().toISOString())
  
  try {
    // Get the Svix headers for verification
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')
    
    console.log('[WEBHOOK] Headers received:', {
      hasSvixId: !!svix_id,
      hasSvixTimestamp: !!svix_timestamp,
      hasSvixSignature: !!svix_signature,
      userAgent: headerPayload.get('user-agent'),
    })

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('[WEBHOOK] Missing Svix headers:', { 
        svix_id: !!svix_id, 
        svix_timestamp: !!svix_timestamp, 
        svix_signature: !!svix_signature 
      })
      return new Response(
        JSON.stringify({ error: 'Missing Svix headers. Ensure this endpoint is called by Clerk webhooks.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get the body as text for signature verification
    // Important: We need the raw body text for signature verification
    const bodyText = await req.text()
    const body = bodyText
    const payload = JSON.parse(bodyText)
    
    console.log('[WEBHOOK] Payload received:', { 
      type: payload.type, 
      userId: payload.data?.id || payload.data?.user_id,
      timestamp: payload.data?.created_at 
    })

    // Get the webhook secret
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || process.env.NEXT_PUBLIC_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
      console.error('[WEBHOOK] WEBHOOK_SECRET is not set in environment variables')
      console.error('[WEBHOOK] Available env vars:', Object.keys(process.env).filter(k => k.includes('WEBHOOK') || k.includes('CLERK')))
      return new Response(
        JSON.stringify({ 
          error: 'WEBHOOK_SECRET is not configured. Please add it to your Vercel environment variables.',
          hint: 'Go to Vercel Dashboard → Your Project → Settings → Environment Variables'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('[WEBHOOK] Secret found:', WEBHOOK_SECRET.substring(0, 10) + '...')

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent
      console.log('[WEBHOOK] Signature verified successfully')
    } catch (err) {
      console.error('[WEBHOOK] Error verifying signature:', err)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid webhook signature. Check your WEBHOOK_SECRET.',
          details: err instanceof Error ? err.message : 'Unknown error'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Handle the webhook
    const eventType = evt.type
    console.log('[WEBHOOK] Processing event type:', eventType)

    // Handle user.created event
    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data

      // Get the primary email
      const primaryEmail = email_addresses?.[0]?.email_address
      const primaryPhone = phone_numbers?.[0]?.phone_number

      if (!primaryEmail) {
        return new Response(
          JSON.stringify({ error: 'No email address found' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      try {
        // Determine role from metadata or default to student
        const role = (evt.data.public_metadata?.role as string) || 'student'

        // Ensure user exists (will create if doesn't exist)
        await ensureUserExists(id, primaryEmail, first_name || undefined, last_name || undefined, primaryPhone || undefined, role)

        const duration = Date.now() - startTime
        console.log(`[WEBHOOK] User processed successfully in ${duration}ms:`, primaryEmail)
        return new Response(
          JSON.stringify({ message: 'User processed successfully', email: primaryEmail, duration }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('[WEBHOOK] Error processing user:', error)
        return new Response(
          JSON.stringify({ error: 'Error processing user', details: error instanceof Error ? error.message : 'Unknown error' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Handle session.created event - create user if they don't exist after sign-in
    if (eventType === 'session.created') {
      const { user_id } = evt.data

      if (!user_id) {
        return new Response(
          JSON.stringify({ error: 'No user ID found in session' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      try {
        // Fetch user details from Clerk API
        const clerk = await clerkClient()
        const clerkUser = await clerk.users.getUser(user_id)

        if (!clerkUser) {
          return new Response(
            JSON.stringify({ error: 'User not found in Clerk' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          )
        }

        // Get user data from Clerk
        const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress
        const primaryPhone = clerkUser.phoneNumbers[0]?.phoneNumber
        const firstName = clerkUser.firstName || ''
        const lastName = clerkUser.lastName || ''
        const role = (clerkUser.publicMetadata?.role as string) || 'student'

        if (!primaryEmail) {
          return new Response(
            JSON.stringify({ error: 'No email address found for user' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }

        // Ensure user exists in our database
        await ensureUserExists(user_id, primaryEmail, firstName, lastName, primaryPhone, role)

        const duration = Date.now() - startTime
        console.log(`[WEBHOOK] Session processed successfully in ${duration}ms:`, user_id)
        return new Response(
          JSON.stringify({ message: 'Session processed successfully', userId: user_id, duration }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('[WEBHOOK] Error processing session:', error)
        return new Response(
          JSON.stringify({ error: 'Error processing session', details: error instanceof Error ? error.message : 'Unknown error' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Handle other event types if needed
    console.log('[WEBHOOK] Unhandled event type:', eventType)
    return new Response(
      JSON.stringify({ message: 'Event received but not handled', eventType }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[WEBHOOK] Unexpected error in webhook handler:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

