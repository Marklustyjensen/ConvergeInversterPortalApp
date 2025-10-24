# Email Service Configuration

## Overview

The investor portal now includes automated email notifications using Resend when new documents are uploaded. This ensures property owners are immediately notified when new financial documents or star reports become available.

## Required Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Resend Email Service Configuration
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourcompany.com"
```

### How to Get These Values

1. **RESEND_API_KEY**:
   - Sign up at https://resend.com
   - Go to your dashboard and create a new API key
   - Copy the API key (starts with "re\_")

2. **RESEND_FROM_EMAIL**:
   - Use an email address from a domain you own
   - Must be verified in your Resend account
   - Examples: `noreply@yourcompany.com`, `portal@yourcompany.com`

## Features

### Automatic Email Notifications

When documents are uploaded through the admin portal:

- All users with access to the property receive an email
- Email includes document details (type, count, date period)
- Professional HTML email template with your branding
- Direct link to sign in to the portal

### Email Template Includes

- Property name
- Document type (Financial Document or Star Report)
- Number of documents uploaded
- Time period (month/year)
- Call-to-action button to access the portal

### Fallback Behavior

- If email service is not configured, document uploads still work normally
- Email failures don't prevent successful document uploads
- All email attempts are logged for debugging

## Testing Email Service

To test that emails are working properly:

1. Ensure environment variables are set correctly
2. Upload a document through the admin interface
3. Check that users assigned to the property receive emails
4. Verify emails appear in both inbox and spam folders initially

## Email Service Status

The system will log warnings if email service is not properly configured but will continue to function for document uploads.

## Development vs Production

### Development

- Use Resend's test mode if available
- Test with your own email addresses
- Check console logs for email service status

### Production

- Verify domain ownership in Resend
- Use a professional "from" email address
- Monitor email delivery rates in Resend dashboard
- Set up proper DNS records (SPF, DKIM) for better deliverability

## Troubleshooting

### Common Issues

1. **Emails not sending**: Check RESEND_API_KEY is correct
2. **Emails going to spam**: Verify domain DNS settings
3. **Invalid from address**: Ensure RESEND_FROM_EMAIL is verified in Resend
4. **No users receiving emails**: Verify users are assigned to the property in UserProperty table

### Debug Logs

Check the console for:

- `Email sent to [email] for property [property name]` (success)
- `Failed to send email to [email]:` (individual failures)
- `Email service not fully configured` (configuration issues)
