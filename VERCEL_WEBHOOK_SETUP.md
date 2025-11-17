# Vercel Webhook Setup Guide

This guide helps you troubleshoot and configure the Clerk webhook on Vercel.

## Common Issues and Solutions

### 1. Webhook Not Being Triggered

**Checklist:**

#### ✅ Environment Variables in Vercel

1. Go to your Vercel Dashboard
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add the following variables:

```
WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DATABASE_URL=your_database_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
```

5. **Important**: Make sure to select the correct environments (Production, Preview, Development)
6. **Redeploy** after adding environment variables

#### ✅ Webhook URL in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks**
4. Click on your webhook endpoint
5. Verify the URL is exactly: `https://your-domain.vercel.app/api/webhooks/clerk`
   - Make sure it's `https://` (not `http://`)
   - Make sure there's no trailing slash
   - Make sure the domain matches your Vercel deployment

#### ✅ Webhook Events Selected

In Clerk Dashboard → Webhooks → Your endpoint:
- ✅ `user.created` should be checked
- ✅ `session.created` should be checked (optional but recommended)

#### ✅ Webhook Secret

1. In Clerk Dashboard → Webhooks → Your endpoint
2. Click on **Signing Secret**
3. Copy the secret (starts with `whsec_`)
4. Make sure it matches exactly in Vercel environment variables

### 2. Testing the Webhook

#### Test the Endpoint Directly

1. Visit: `https://your-domain.vercel.app/api/webhooks/clerk/test`
2. You should see a JSON response with:
   ```json
   {
     "message": "Webhook endpoint is accessible",
     "env": {
       "hasWebhookSecret": true,
       "hasDatabaseUrl": true
     }
   }
   ```

#### Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on the latest deployment
3. Go to **Functions** tab
4. Look for `/api/webhooks/clerk`
5. Click on it to see logs
6. Look for logs starting with `[WEBHOOK]`

#### Check Clerk Dashboard Logs

1. Go to Clerk Dashboard → Webhooks
2. Click on your webhook endpoint
3. Go to **Logs** tab
4. You'll see delivery attempts and responses

### 3. Common Error Messages

#### "Missing Svix headers"

**Cause**: The request is not coming from Clerk, or the headers are being stripped.

**Solution**:
- Verify the webhook URL in Clerk Dashboard
- Check if you have any middleware that might be modifying headers
- Make sure the route is not being blocked

#### "WEBHOOK_SECRET is not configured"

**Cause**: Environment variable is not set in Vercel.

**Solution**:
1. Add `WEBHOOK_SECRET` to Vercel environment variables
2. Make sure to select the correct environment (Production/Preview)
3. Redeploy after adding the variable

#### "Invalid webhook signature"

**Cause**: The `WEBHOOK_SECRET` doesn't match the one in Clerk.

**Solution**:
1. Verify the secret in Clerk Dashboard matches exactly
2. Make sure there are no extra spaces or characters
3. Copy the secret directly from Clerk (starts with `whsec_`)
4. Redeploy after updating

#### "Database connection error"

**Cause**: `DATABASE_URL` is not set or incorrect.

**Solution**:
1. Verify `DATABASE_URL` is set in Vercel
2. Make sure it's a valid connection string
3. Check if your database allows connections from Vercel's IPs

### 4. Debugging Steps

#### Step 1: Verify Deployment

```bash
# Check if the route exists
curl https://your-domain.vercel.app/api/webhooks/clerk/test
```

#### Step 2: Check Environment Variables

The test endpoint will show if environment variables are loaded:
```json
{
  "hasWebhookSecret": true,
  "hasDatabaseUrl": true
}
```

#### Step 3: Test Webhook Manually

You can test the webhook using Clerk's "Send test event" feature:
1. Go to Clerk Dashboard → Webhooks → Your endpoint
2. Click "Send test event"
3. Select `user.created`
4. Check the response

#### Step 4: Check Logs

Check logs in both:
- **Vercel**: Dashboard → Deployments → Functions → Logs
- **Clerk**: Dashboard → Webhooks → Your endpoint → Logs

### 5. Vercel-Specific Configuration

#### Route Configuration

The webhook route is configured with:
```typescript
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
```

This ensures:
- The route runs on Node.js runtime
- It's not statically generated
- It can handle dynamic requests

#### Function Timeout

By default, Vercel functions have a timeout. If your database operations are slow, you might need to:
- Upgrade to a Vercel Pro plan for longer timeouts
- Optimize your database queries
- Use connection pooling

### 6. Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Webhook URL configured in Clerk (using production domain)
- [ ] Webhook secret matches in both places
- [ ] Database connection string is correct
- [ ] Webhook events are selected in Clerk
- [ ] Test endpoint returns success
- [ ] Logs show webhook being received

### 7. Still Not Working?

If the webhook still doesn't work:

1. **Check Vercel logs** for any errors
2. **Check Clerk logs** for delivery status
3. **Verify the webhook URL** is accessible (test endpoint)
4. **Check database connection** separately
5. **Try creating a test user** in Clerk to trigger the webhook
6. **Check network tab** in browser if testing manually

### 8. Monitoring

Set up monitoring for your webhook:
- Vercel Analytics can show function execution times
- Clerk Dashboard shows delivery success rates
- Consider adding error tracking (e.g., Sentry)

## Quick Test

Run this to test your webhook setup:

```bash
# Test endpoint accessibility
curl https://your-domain.vercel.app/api/webhooks/clerk/test

# Expected response:
# {
#   "message": "Webhook endpoint is accessible",
#   "env": {
#     "hasWebhookSecret": true,
#     "hasDatabaseUrl": true
#   }
# }
```

If the test endpoint works but webhooks don't trigger, check:
1. Clerk webhook configuration
2. Webhook secret matching
3. Event selection in Clerk Dashboard

