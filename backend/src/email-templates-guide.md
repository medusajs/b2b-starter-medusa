# SendGrid Email Templates Setup Guide

This guide describes the dynamic template data that will be sent to each SendGrid template. You need to create these templates in your SendGrid dashboard.

## 1. Customer Confirmation Template (SENDGRID_CUSTOMER_CONFIRMATION_TEMPLATE)

### Template Variables:
- `{{customer_name}}` - Full name of the customer
- `{{customer_email}}` - Email address of the customer  
- `{{company_name}}` - Name of the customer's company (if applicable)

### Example HTML Template:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Our Store!</h1>
        </div>
        <div class="content">
            <p>Hi {{customer_name}},</p>
            <p>Thank you for creating an account with us. Your account has been successfully created.</p>
            <p><strong>Account Details:</strong></p>
            <ul>
                <li>Email: {{customer_email}}</li>
                {{#if company_name}}
                <li>Company: {{company_name}}</li>
                {{/if}}
            </ul>
            <p>You can now log in and start shopping!</p>
        </div>
    </div>
</body>
</html>
```

## 2. Order Placed Template (SENDGRID_ORDER_PLACED_TEMPLATE)

### Template Variables:
- `{{order_id}}` - Order UUID
- `{{order_display_id}}` - Human-readable order number
- `{{customer_name}}` - Customer's full name
- `{{customer_email}}` - Customer's email
- `{{order_total}}` - Total order amount (formatted)
- `{{currency}}` - Currency code (e.g., USD)
- `{{items}}` - Array of order items with:
  - `title` - Product title
  - `quantity` - Quantity ordered
  - `price` - Unit price
  - `total` - Line total
- `{{shipping_address}}` - Shipping address object
- `{{billing_address}}` - Billing address object

### Example HTML Template:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
        .order-details { background-color: #f8f9fa; padding: 15px; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmed!</h1>
        </div>
        <div class="content">
            <p>Hi {{customer_name}},</p>
            <p>Thank you for your order! We've received it and will begin processing it shortly.</p>
            
            <div class="order-details">
                <h3>Order #{{order_display_id}}</h3>
                <p>Order Total: {{currency}} {{order_total}}</p>
            </div>
            
            <h3>Order Items:</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each items}}
                    <tr>
                        <td>{{this.title}}</td>
                        <td>{{this.quantity}}</td>
                        <td>{{../currency}} {{this.price}}</td>
                        <td>{{../currency}} {{this.total}}</td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
```

## 3. Order Shipped Template (SENDGRID_ORDER_SHIPPED_TEMPLATE)

### Template Variables:
- `{{order_id}}` - Order UUID
- `{{order_display_id}}` - Human-readable order number
- `{{customer_name}}` - Customer's full name
- `{{customer_email}}` - Customer's email
- `{{tracking_number}}` - Shipment tracking number
- `{{tracking_url}}` - Tracking URL (if available)
- `{{carrier}}` - Shipping carrier name
- `{{items}}` - Array of shipped items with:
  - `title` - Product title
  - `quantity` - Quantity shipped
- `{{shipping_address}}` - Shipping address object

### Example HTML Template:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
        .tracking-info { background-color: #f8f9fa; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Order Has Been Shipped!</h1>
        </div>
        <div class="content">
            <p>Hi {{customer_name}},</p>
            <p>Great news! Your order #{{order_display_id}} has been shipped and is on its way to you.</p>
            
            <div class="tracking-info">
                <h3>Tracking Information</h3>
                <p><strong>Carrier:</strong> {{carrier}}</p>
                <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
                {{#if tracking_url}}
                <p><a href="{{tracking_url}}" class="button">Track Your Package</a></p>
                {{/if}}
            </div>
            
            <h3>Items Shipped:</h3>
            <ul>
                {{#each items}}
                <li>{{this.title}} (Qty: {{this.quantity}})</li>
                {{/each}}
            </ul>
        </div>
    </div>
</body>
</html>
```

## 4. Password Reset Template (SENDGRID_CUSTOMER_RESET_PASSWORD_TEMPLATE)

### Template Variables:
- `{{customer_name}}` - Customer's full name
- `{{reset_url}}` - Password reset URL with token

### Example HTML Template:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .button { display: inline-block; padding: 15px 30px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Hi {{customer_name}},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
                <a href="{{reset_url}}" class="button">Reset Password</a>
            </div>
            
            <p>If you didn't request this, you can safely ignore this email. Your password won't be changed.</p>
            <p>This link will expire in 24 hours for security reasons.</p>
        </div>
    </div>
</body>
</html>
```

## Setup Instructions

1. Log in to your SendGrid account
2. Navigate to Email API > Dynamic Templates
3. Create a new template for each email type
4. Copy the template ID and add it to your .env file
5. Use the HTML examples above as a starting point and customize as needed
6. Test each template using SendGrid's preview and test features

## Testing

To test the email functionality:
1. Create a new customer account - should trigger customer confirmation email
2. Place an order - should trigger order placed email  
3. Create a fulfillment for an order - should trigger order shipped email