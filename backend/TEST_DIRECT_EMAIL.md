# Direct Email Test

## Test the Direct Email Endpoint

### 1. Test with curl:
```bash
curl -X POST http://localhost:9000/admin/send-password-reset-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "token": "test-token-123"
  }'
```

### 2. Expected Response:
```json
{
  "success": true,
  "message": "Password reset email sent successfully",
  "statusCode": 202,
  "messageId": "some-message-id",
  "email": "your-email@example.com",
  "resetUrl": "http://localhost:8000/reset-password?token=test-token-123"
}
```

### 3. Check Logs:
You should see:
```
🚨🚨🚨 DIRECT EMAIL SENDING ENDPOINT CALLED! 🚨🚨🚨
📧 [DirectEmail] Email: your-email@example.com
🔑 [DirectEmail] Token: present
✅ [DirectEmail] Email sent successfully!
```

## How It Works

1. Frontend calls `forgotPassword()` function
2. Function gets token from Medusa SDK
3. Function immediately calls the direct email endpoint
4. Backend sends email directly via SendGrid
5. No subscriber dependency - works every time

This bypasses all the subscriber issues and sends emails directly.
