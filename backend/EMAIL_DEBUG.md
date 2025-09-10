# Email Debugging Guide

## Current Issue
Password reset emails are not being sent. The event `auth.password_reset` is being emitted but shows "0 subscribers".

## Debugging Steps

### 1. Check Subscriber Registration
The subscriber should be loaded when the backend starts. Look for these logs:
```
🔧 [PasswordReset] Subscriber file loaded!
🔧 [PasswordReset] EmailService import: true
🔧 [PasswordReset] Subscriber function defined
🔧 [PasswordReset] Subscriber config exported: { event: 'auth.password_reset', context: { subscriberId: 'password-reset-handler' } }
```

### 2. Check Event Emission
When requesting a password reset, you should see:
```
🚨🚨🚨 PASSWORD RESET SUBSCRIBER TRIGGERED! 🚨🚨🚨
========== PASSWORD RESET SUBSCRIBER START ==========
```

### 3. Check Email Service Configuration
The email service should log:
```
📧 [EmailService] Sending password reset email to: [email]
📧 [EmailService] API Key present: true
📧 [EmailService] Template ID: [template-id]
```

### 4. Environment Variables Required
Make sure these are set in your `.env` file:
```env
SENDGRID_API_KEY=SG.your_key_here
SENDGRID_FROM=your_verified_email@domain.com
SENDGRID_CUSTOMER_RESET_PASSWORD_TEMPLATE=d-your_template_id
```

### 5. Test Email Configuration
Visit: `http://localhost:9000/admin/test-email` to test your SendGrid configuration.

## Fixes Applied

1. ✅ Fixed event name to `auth.password_reset`
2. ✅ Added subscriber context with `subscriberId`
3. ✅ Added detailed logging for debugging
4. ✅ Enhanced error handling in email service

## Next Steps

1. **Restart the backend** to pick up subscriber changes
2. **Test password reset** and check logs
3. **Verify SendGrid configuration** using the test endpoint
4. **Check environment variables** are properly loaded

## If Still Not Working

1. Check if the subscriber is being loaded at startup
2. Verify the event bus is working (Redis connection)
3. Test with a simple email send to isolate the issue
4. Check SendGrid account status and API key permissions
