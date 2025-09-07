# Email System Logging Guide

## Overview
The email system now includes comprehensive logging at every stage of the email sending process. All log messages are prefixed with tags for easy filtering.

## Log Prefixes
- `[LOADER]` - Email service initialization
- `[EMAIL]` - Email service operations
- `[SUBSCRIBER]` - Event subscriber operations

## Log Levels

### INFO Level
- Service initialization status
- Event triggers
- Email sending attempts
- Successful email sends (marked with ✅)

### DEBUG Level
- Detailed data retrieval operations
- Template data being sent
- SendGrid message configuration
- Query operations

### WARN Level
- Missing email addresses
- Missing SendGrid configuration
- Failed company/employee lookups

### ERROR Level
- Failed email sends (marked with ❌)
- Exception details with stack traces
- SendGrid API errors

## What's Being Logged

### 1. Service Initialization
```
[EMAIL] ✅ SendGrid email service initialized successfully
  - Shows configured templates
  - Shows from email address
```

### 2. Customer Creation Flow
```
[SUBSCRIBER] Customer created event triggered
[SUBSCRIBER] Retrieving customer data
[SUBSCRIBER] Querying for employee/company data
[EMAIL] Attempting to send customer confirmation email
[EMAIL] Customer confirmation template data: {...}
[EMAIL] ✅ Customer confirmation email sent successfully
```

### 3. Order Placement Flow
```
[SUBSCRIBER] Order placed event triggered
[SUBSCRIBER] Retrieving order data
[SUBSCRIBER] Retrieving customer data
[EMAIL] Attempting to send order placed email
[EMAIL] Order placed template data: {...}
[EMAIL] ✅ Order placed email sent successfully
```

### 4. Fulfillment/Shipping Flow
```
[SUBSCRIBER] Fulfillment shipped event triggered
[SUBSCRIBER] Retrieving fulfillment data
[SUBSCRIBER] Querying for order link
[SUBSCRIBER] Retrieving order data
[EMAIL] Attempting to send order shipped email
[EMAIL] Order shipped template data: {...}
[EMAIL] ✅ Order shipped email sent successfully
```

## Error Tracking
All errors include:
- Error message
- Stack trace
- SendGrid response body (if available)
- HTTP status codes

## Monitoring Commands

### View all email logs
```bash
grep "\[EMAIL\]" logs/medusa.log
```

### View successful emails
```bash
grep "✅" logs/medusa.log
```

### View failed emails
```bash
grep "❌" logs/medusa.log
```

### View subscriber activity
```bash
grep "\[SUBSCRIBER\]" logs/medusa.log
```

### Monitor real-time email activity
```bash
tail -f logs/medusa.log | grep -E "\[EMAIL\]|\[SUBSCRIBER\]"
```

## Testing Email System

1. **Test Customer Creation Email**
```bash
# Create a new customer via API or admin
# Watch logs for: [SUBSCRIBER] Customer created event triggered
```

2. **Test Order Placement Email**
```bash
# Place an order
# Watch logs for: [SUBSCRIBER] Order placed event triggered
```

3. **Test Fulfillment Email**
```bash
# Create a fulfillment for an order
# Watch logs for: [SUBSCRIBER] Fulfillment shipped event triggered
```

## Debugging Tips

1. **Email Not Sending?**
   - Check for `[EMAIL] ⚠️ SendGrid API key not configured`
   - Look for `has no email address` warnings
   - Check SendGrid template IDs in logs

2. **Template Data Issues?**
   - Look for `[EMAIL] ... template data:` debug logs
   - Verify all required fields are present

3. **SendGrid API Errors?**
   - Check error logs for `statusCode` and `response.body`
   - Common issues: Invalid template ID, missing dynamic data

4. **Event Not Triggering?**
   - Ensure subscribers are registered
   - Check for `[SUBSCRIBER] ... event triggered` logs
   - Verify event names match configuration