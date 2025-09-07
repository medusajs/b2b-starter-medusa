# SendGrid Email Setup - Fixing 401 Unauthorized Error

## Issue
You're getting a 401 Unauthorized error from SendGrid. This means your API key is invalid, expired, or doesn't have the necessary permissions.

## Solution Steps

### 1. Generate a New SendGrid API Key

1. Log in to your SendGrid account at https://app.sendgrid.com/
2. Go to **Settings > API Keys**
3. Click **Create API Key**
4. Give it a name like "Medusa B2B"
5. Select **Full Access** (or at minimum, **Mail Send** permissions)
6. Click **Create & View**
7. **COPY THE API KEY NOW** - you won't be able to see it again!

### 2. Update Your .env File

Replace the old API key in your `.env` file:
```env
SENDGRID_API_KEY=YOUR_NEW_API_KEY_HERE
```

The key should start with `SG.` and be about 69 characters long.

### 3. Verify Your SendGrid Templates

Make sure these template IDs in your `.env` file are correct:
```env
SENDGRID_CUSTOMER_CONFIRMATION_TEMPLATE=d-d36dbd4a1d9d454b85eb5cf8dd101e76
SENDGRID_ORDER_PLACED_TEMPLATE=d-d562717abf314fe1ac9d64773fd5eb00
SENDGRID_ORDER_SHIPPED_TEMPLATE=d-1c82578ab41c4eaa8eab37600586d3dd
SENDGRID_CUSTOMER_RESET_PASSWORD_TEMPLATE=d-a9040027c0f34707843bc06b77631d39
```

To verify:
1. Go to **Email API > Dynamic Templates** in SendGrid
2. Check that each template ID matches what's in your `.env`
3. Ensure all templates are **Active**

### 4. Verify Your Sender Email

Make sure `info@bntbng.com` is verified in SendGrid:
1. Go to **Settings > Sender Authentication**
2. Verify the domain or single sender address
3. If not verified, follow SendGrid's verification process

### 5. Restart Your Backend

After updating the `.env` file:
```bash
cd backend
npm run dev
```

## Testing

1. Create a new customer account to test the confirmation email
2. Check the console logs for:
   - `[EMAIL] ✅ SendGrid email service initialized` - Should show your masked API key
   - `[EMAIL] ✅ Customer confirmation email sent successfully` - Success!
   - `[EMAIL] ⚠️ SendGrid API Key is invalid` - Still an issue with the key

## Common Issues

### API Key Issues
- **Starts with 'SG.'**: All SendGrid API keys start with this prefix
- **Length**: Should be approximately 69 characters
- **Permissions**: Needs at least "Mail Send" permission
- **Whitespace**: Make sure there are no extra spaces or newlines in your `.env` file

### Template Issues
- **Template Not Found**: Double-check the template ID
- **Template Not Active**: Activate the template in SendGrid
- **Missing Variables**: Ensure all template variables are provided

### Sender Verification Issues
- **Unverified Sender**: The "from" email must be verified in SendGrid
- **Domain Authentication**: Consider setting up domain authentication for better deliverability

## Environment Variables Check

Run this command to verify your environment variables are loaded:
```bash
cd backend
node -e "console.log({
  API_KEY: process.env.SENDGRID_API_KEY ? 'SET (' + process.env.SENDGRID_API_KEY.length + ' chars)' : 'NOT SET',
  FROM: process.env.SENDGRID_FROM || 'NOT SET',
  TEMPLATES: {
    CUSTOMER: process.env.SENDGRID_CUSTOMER_CONFIRMATION_TEMPLATE || 'NOT SET',
    ORDER: process.env.SENDGRID_ORDER_PLACED_TEMPLATE || 'NOT SET',
    SHIPPED: process.env.SENDGRID_ORDER_SHIPPED_TEMPLATE || 'NOT SET',
    RESET: process.env.SENDGRID_CUSTOMER_RESET_PASSWORD_TEMPLATE || 'NOT SET'
  }
})"
```

## Need More Help?

If you're still getting 401 errors after following these steps:
1. Check SendGrid's API logs for more details
2. Try creating a completely new API key
3. Contact SendGrid support
4. Check if your SendGrid account is active and not suspended