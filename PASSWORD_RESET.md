# Password Reset Functionality

This application includes a complete password reset system using Resend for email delivery.

## Setup

1. **Get a Resend API Key**:

   - Sign up at [resend.com](https://resend.com)
   - Create a new API key
   - Add it to your `.env` file as `RESEND_API_KEY`

2. **Configure Environment Variables**:

   - Copy `.env.example` to `.env`
   - Fill in the required values:
     ```
     RESEND_API_KEY=your-resend-api-key
     FROM_EMAIL=noreply@yourdomain.com
     NEXTAUTH_URL=http://localhost:3000
     ```

3. **Database Migration**:
   The password reset functionality requires additional fields in your User model:

   - `resetToken` (String, optional)
   - `resetTokenExpiry` (DateTime, optional)

   These have already been added to your schema and migrated.

## How It Works

### For Users:

1. User visits the sign-in page
2. Clicks "Forgot your password?" link
3. Enters their email address
4. Receives an email with a reset link (valid for 1 hour)
5. Clicks the link to visit the reset password page
6. Enters a new password
7. Gets redirected to the sign-in page

### API Endpoints:

- `POST /api/resetPasswordEmail` - Sends password reset email
- `POST /api/resetPassword` - Processes password reset with token

### Pages:

- `/forgot-password` - Form to request password reset
- `/reset-password?token=...` - Form to set new password

## Security Features

1. **Token Expiry**: Reset tokens expire after 1 hour
2. **Single Use**: Tokens are cleared after successful password reset
3. **Email Verification**: Only works with valid email addresses in the database
4. **No Information Disclosure**: Doesn't reveal if an email exists in the system

## Important Security Note

⚠️ **WARNING**: The current implementation stores passwords in plain text, which is not secure for production use. You should implement password hashing using bcrypt or similar library before deploying to production.

Example with bcrypt:

```javascript
import bcrypt from "bcrypt";

// When storing password
const hashedPassword = await bcrypt.hash(password, 10);

// When verifying password
const isValid = await bcrypt.compare(password, user.password);
```

## Testing

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000/forgot-password`
3. Enter a valid email address from your database
4. Check your email for the reset link
5. Follow the link to reset your password
