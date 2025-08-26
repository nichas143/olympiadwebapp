# Email Setup Guide

## Gmail Configuration

To enable email notifications, you need to configure Gmail SMTP:

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-factor authentication

### 2. Generate App Password
- Go to Google Account > Security > App passwords
- Generate a new app password for "Mail"
- Copy the generated password

### 3. Environment Variables
Create a `.env.local` file in your project root with:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# MongoDB Configuration
MONGODB_URI=your-mongodb-connection-string
```

### 4. Email Features

#### Admin Notification
- Sent to: sachin.gadkar@gmail.com
- Contains: Complete student details and prerequisites
- Triggered: On every successful registration

#### Student Thank You Email
- Sent to: Student's email address
- Contains: Confirmation and next steps
- Triggered: On every successful registration

## Spam Protection Features

### 1. Email Validation
- Format validation
- Disposable email domain blocking
- Suspicious pattern detection

### 2. Rate Limiting
- 3 attempts per minute per IP
- 2 attempts per 5 minutes per email

### 3. Content Validation
- Blocks suspicious names/patterns
- Validates school names
- Prevents bot submissions

### 4. Disposable Email Domains Blocked
- tempmail.org
- guerrillamail.com
- mailinator.com
- 10minutemail.com
- And many more...

## Testing

To test the email functionality:

1. Set up your environment variables
2. Submit a test registration
3. Check both email addresses for notifications
4. Verify spam protection by trying suspicious inputs

## Troubleshooting

### Email Not Sending
- Check Gmail credentials
- Verify app password is correct
- Check console for error messages

### Rate Limiting Issues
- Wait for the time window to expire
- Use different IP/email for testing

### Spam Protection Too Strict
- Modify validation rules in `src/lib/email.ts`
- Adjust rate limiting parameters
