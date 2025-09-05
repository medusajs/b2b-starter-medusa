# Debug Order Email Issues

## Problem: Order emails not sending

### 1. Test Your Email Configuration First
```bash
# Test if SendGrid is working
curl http://localhost:9000/admin/test-email
```

### 2. Manually Test Order Email
After placing an order, get the order ID and test:

```bash
# Replace ORDER_ID with your actual order ID
curl -X POST http://localhost:9000/admin/test-order-email \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORDER_ID_HERE",
    "email": "test@example.com"
  }'
```

### 3. What to Look for in Logs

#### When an Order is Placed:
You should see these logs in sequence:

```
[SUBSCRIBER] 📦 Order event received!
  - Shows which event was triggered (order.placed, order.completed, etc.)
  - Shows the order ID

[SUBSCRIBER] Retrieving order data
  - Fetching order details

[SUBSCRIBER] Order data retrieved
  - Shows order details including display_id, customer_id, total

[SUBSCRIBER] Retrieving customer data
  - Fetching customer info

[SUBSCRIBER] Customer data retrieved
  - Shows customer email

[SUBSCRIBER] Sending order placed email
  - Attempting to send

[EMAIL] Attempting to send order placed email
  - Email service starting

[EMAIL] Order placed template data
  - Shows what data is being sent to template

[EMAIL] Sending order placed email with SendGrid
  - Actual API call

Either:
[EMAIL] ✅ Order placed email sent successfully
[SUBSCRIBER] ✅ Order placed email successfully sent

OR:
[EMAIL] ❌ Failed to send order placed email
[EMAIL] 🔐 AUTHENTICATION FAILED (401 error)
[SUBSCRIBER] ⚠️ Order placed email was NOT sent
```

### 4. Common Issues and Solutions

#### No "[SUBSCRIBER] 📦 Order event received!" log
**Problem**: The order event is not being triggered
**Solutions**:
- Check if the order workflow is completing properly
- Verify order status is actually changing to "placed" or "completed"
- Check if event bus is working (Redis connection)

#### "[EMAIL] 🔐 AUTHENTICATION FAILED"
**Problem**: SendGrid API key is invalid (401 error)
**Solution**: Generate a new API key from SendGrid

#### "[EMAIL] 🚫 FORBIDDEN"
**Problem**: Sender email not verified (403 error)
**Solution**: Verify `info@bntbng.com` in SendGrid sender authentication

#### "[EMAIL] 📧 BAD REQUEST"
**Problem**: Template ID is wrong (400 error)
**Solution**: Check template ID in .env matches SendGrid

#### No customer email found
**Problem**: Order has no customer or customer has no email
**Solution**: Ensure customer is logged in when placing order

### 5. Check Event Bus (Redis)

Order events require Redis to work. Check if Redis is running:

```bash
# Check Redis connection
redis-cli ping
# Should return: PONG

# Monitor Redis events in real-time
redis-cli MONITOR
# Place an order and watch for events
```

### 6. Verify Subscriber Registration

Check if the order subscriber is registered:

```bash
# Look for subscriber registration in startup logs
grep "order.placed" logs/medusa.log
```

### 7. Manual Email Test Script

If the test endpoint works but orders don't trigger emails, the issue is with event emission. Run this to check:

```bash
# Get most recent order
curl http://localhost:9000/admin/orders?limit=1

# Use the order ID to test email
curl -X POST http://localhost:9000/admin/test-order-email \
  -H "Content-Type: application/json" \
  -d '{"order_id": "ORDER_ID", "email": "your-email@example.com"}'
```

### 8. Check Order Workflow

The order might not be emitting the right events. Check order status:

```bash
# Get order details
curl http://localhost:9000/admin/orders/ORDER_ID
```

Look for:
- `status`: Should be "pending" or "completed"
- `payment_status`: Should be "captured" or "authorized"
- `fulfillment_status`: Related to shipping emails

### 9. Enable Debug Logging

Add more verbose logging by updating your .env:

```env
LOG_LEVEL=debug
```

Then restart the backend.

### 10. Events We're Now Listening To

The order email subscriber now listens for:
- `order.placed` - When order is initially placed
- `order.completed` - When order is completed
- `order.confirmed` - When order is confirmed
- `order.payment_captured` - When payment is captured
- `order.payment_authorized` - When payment is authorized
- `order.payment_collection_created` - When payment collection starts
- `order.payment_required` - When payment is needed
- `order.fulfillment_created` - When fulfillment is created

One of these SHOULD trigger when you place an order!

## Quick Diagnostic Command

Run this to get a full diagnostic:

```bash
echo "=== Email Configuration ===" && \
curl -s http://localhost:9000/admin/test-email | jq . && \
echo -e "\n=== Redis Status ===" && \
redis-cli ping && \
echo -e "\n=== Recent Orders ===" && \
curl -s "http://localhost:9000/admin/orders?limit=3" | jq '.orders[] | {id, display_id, status, created_at}'
```

This will show:
1. Your SendGrid configuration status
2. Redis connection (needed for events)
3. Recent orders to test with