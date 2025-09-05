# Testing Email Configuration

## Quick Test Endpoint

I've created a test endpoint to verify your SendGrid configuration. Run this:

```bash
curl http://localhost:9000/admin/test-email
```

This will show:
- If your API key exists and is formatted correctly
- If the API key is valid (tests with SendGrid)
- All your email configuration
- Specific recommendations to fix any issues

## What to Check

### 1. Check the API Key Status
Look for the `apiKeyTest` section:
- `valid: true` = Your API key works! ✅
- `valid: false` with error code 401 = Invalid API key 🔐
- `valid: false` with error code 403 = Permission/sender issues 🚫

### 2. Current Issue
Based on your logs, you have a **401 Unauthorized error**, which means:
- Your API key is invalid or expired
- You need to generate a new one from SendGrid

## Fix Steps

1. **Generate New API Key**:
   ```
   1. Go to https://app.sendgrid.com/
   2. Settings > API Keys
   3. Create API Key
   4. Select "Full Access"
   5. Copy the key (starts with SG.)
   ```

2. **Update .env**:
   ```env
   SENDGRID_API_KEY=SG.your_new_key_here
   ```

3. **Restart Backend**:
   ```bash
   cd backend
   npm run dev
   ```

4. **Test Again**:
   ```bash
   curl http://localhost:9000/admin/test-email
   ```

## What You Should See in Logs

When working correctly:
```
[EMAIL] ✅ SendGrid email service initialized
[EMAIL] ✅ Customer confirmation email sent successfully
[SUBSCRIBER] ✅ Customer created email successfully sent
```

When failing (like now):
```
[EMAIL] ❌ Failed to send customer confirmation email
[EMAIL] 🔐 AUTHENTICATION FAILED - SendGrid API Key is invalid!
[SUBSCRIBER] ⚠️ Customer created email was NOT sent
```

## Manual Test

After fixing the API key, create a test customer:

```bash
curl -X POST http://localhost:9000/admin/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User"
  }'
```

Then check the logs for success messages!