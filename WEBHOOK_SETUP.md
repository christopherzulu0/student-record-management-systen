# Clerk Webhook Setup Guide

This guide explains how to set up the Clerk webhook to automatically create user records in your database when users sign in.

## Prerequisites

1. Clerk account and application set up
2. Database connection configured (DATABASE_URL in .env)
3. Prisma schema migrated

## Setup Steps

### 1. Install Dependencies

The webhook endpoint requires the `svix` package for webhook signature verification:

```bash
pnpm add svix
```

### 2. Environment Variables

Add the following to your `.env.local` file:

```env
WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Get Webhook Secret from Clerk

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks** in the sidebar
4. Click **Add Endpoint**
5. Enter your webhook URL: `https://yourdomain.com/api/webhooks/clerk`
6. Select the following events:
   - `user.created` - Creates user when they first sign up
   - `session.created` - Creates user if they don't exist after sign-in
7. Copy the **Signing Secret** (starts with `whsec_`)
8. Add it to your `.env.local` as `WEBHOOK_SECRET`

### 4. Webhook Endpoint

The webhook endpoint is located at:
- **Route**: `/api/webhooks/clerk`
- **Method**: `POST`
- **File**: `app/api/webhooks/clerk/route.ts`

### 5. How It Works

The webhook handles two events:

#### `user.created` Event
- Triggered when a new user signs up in Clerk
- Automatically creates a user record in your database
- Sets default role to `student` unless specified in Clerk metadata

#### `session.created` Event
- Triggered when a user signs in (creates a new session)
- Checks if the user exists in your database
- If not, fetches user details from Clerk API and creates the record
- This ensures users who signed up before webhook was configured are created

### 6. User Role Assignment

You can set user roles in Clerk's public metadata:

1. Go to Clerk Dashboard → Users
2. Select a user
3. Click on **Metadata** tab
4. Add to **Public metadata**:
   ```json
   {
     "role": "admin"  // or "teacher" or "student"
   }
   ```

If no role is specified, the default is `student`.

### 7. Local Development Setup

**Important**: Clerk cannot reach `localhost` URLs. You need to use a tunnel service for local development.

#### Option 1: Using ngrok (Recommended)

1. **Install ngrok**:
   ```bash
   # Download from https://ngrok.com/download
   # Or using npm:
   npm install -g ngrok
   ```

2. **Start your Next.js dev server**:
   ```bash
   pnpm dev
   ```

3. **Start ngrok tunnel**:
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Update Clerk Webhook URL**:
   - Go to Clerk Dashboard → Webhooks
   - Edit your webhook endpoint
   - Use: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - Save the changes

6. **Test the connection**:
   - Visit: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk/test`
   - You should see a JSON response confirming the endpoint is accessible

#### Option 2: Using Clerk's Local Testing

For testing without a tunnel, you can use Clerk's local webhook testing feature:
- Use the webhook endpoint URL: `http://localhost:3000/api/webhooks/clerk`
- Note: This only works for testing within Clerk's dashboard, not for actual webhook delivery

### 8. Testing

1. **Test endpoint accessibility**:
   ```bash
   curl http://localhost:3000/api/webhooks/clerk/test
   ```
   Or visit: `http://localhost:3000/api/webhooks/clerk/test` in your browser

2. **Check webhook logs in Clerk Dashboard**:
   - Go to Clerk Dashboard → Webhooks
   - Click on your webhook endpoint
   - View the "Logs" tab to see delivery attempts and errors

3. **Test user creation**:
   - Create a test user in Clerk
   - Check your application console logs for webhook processing
   - Check your database to verify the user was created

4. **Check application logs**:
   - Look for console.log messages in your terminal
   - Errors will be logged with details

### 8. Security

- Webhook signature verification ensures requests are from Clerk
- The webhook secret should never be committed to version control
- Always use HTTPS in production

## Troubleshooting

### Webhook showing "Failed" status in Clerk Dashboard

**Common causes:**

1. **Using localhost URL**:
   - ❌ `http://localhost:3000/api/webhooks/clerk` - Clerk cannot reach this
   - ✅ Use ngrok or deploy to a public URL
   - Solution: Use `ngrok http 3000` and update webhook URL to the ngrok HTTPS URL

2. **Missing WEBHOOK_SECRET**:
   - Check your `.env.local` file has `WEBHOOK_SECRET=whsec_...`
   - Restart your dev server after adding the secret
   - Solution: Copy the signing secret from Clerk Dashboard → Webhooks → Your endpoint

3. **Invalid webhook signature**:
   - The WEBHOOK_SECRET doesn't match the one in Clerk
   - Solution: Verify the secret matches exactly (including the `whsec_` prefix)

4. **Endpoint not accessible**:
   - The URL is not publicly reachable
   - Solution: Test with `/api/webhooks/clerk/test` endpoint first

5. **Database connection issues**:
   - Check DATABASE_URL is set correctly
   - Verify Prisma can connect to the database
   - Solution: Test database connection separately

### Debugging Steps

1. **Check endpoint is accessible**:
   ```bash
   curl https://your-ngrok-url.ngrok.io/api/webhooks/clerk/test
   ```

2. **Check application logs**:
   - Look for console.log messages in your terminal
   - Webhook events are logged with details

3. **Check Clerk Dashboard logs**:
   - Go to Webhooks → Your endpoint → Logs
   - View delivery attempts and error messages

4. **Verify environment variables**:
   ```bash
   # Check if variables are loaded
   node -e "console.log(process.env.WEBHOOK_SECRET ? 'Set' : 'Not set')"
   ```

### Users not being created
- Check database connection (DATABASE_URL)
- Verify Prisma schema is up to date
- Check application logs for errors
- Ensure email addresses are present in Clerk user data

### Duplicate users
- The webhook checks for existing users by email before creating
- If duplicates occur, check email uniqueness constraints

## Next Steps

After setting up the webhook, you may want to:
1. Create related records (Student, Teacher, Admin) based on role
2. Send welcome emails
3. Set up user profile completion flows

