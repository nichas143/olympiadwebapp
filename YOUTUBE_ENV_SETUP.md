# YouTube Private Video Environment Setup

## Required Environment Variables

Add these to your `.env.local` file:

```env
# YouTube Data API v3 Configuration
YOUTUBE_API_KEY=your_youtube_api_key_here

# Video Access Security
VIDEO_ACCESS_SECRET=your_secure_secret_generated_with_openssl
ALLOWED_DOMAINS=yourdomain.com,localhost:3000,127.0.0.1:3000

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
FREE_ACCESS=false

# Google Service Account (already configured for PDF access)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id"...}
```

## Setup Steps

### 1. Enable YouTube Data API v3

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your existing project (same as PDF setup)
3. Navigate to "APIs & Services" > "Library"
4. Search for "YouTube Data API v3"
5. Click "Enable"

### 2. Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Click "Restrict Key" and add HTTP referrers for security

### 3. Generate Video Access Secret

```bash
# Generate a secure secret for JWT tokens
openssl rand -base64 32
```

### 4. Update Service Account Permissions

Add YouTube API scope to your existing service account:

1. Go to "APIs & Services" > "Credentials"
2. Click on your service account email
3. Go to "Keys" tab (you already have this from PDF setup)
4. The existing service account will work with YouTube API

### 5. Configure Allowed Domains

List all domains where your app will be accessed:
- Production domain: `yourdomain.com`
- Development: `localhost:3000`
- Additional domains as needed

## Testing

After setup, test with a YouTube URL:

1. Create content with YouTube URL in admin panel
2. Set `isPrivateVideo: true` for secure access
3. Test video loading in video lectures page
4. Check browser console for any errors

## Security Notes

- ✅ API key can be restricted to specific domains
- ✅ Service account has read-only permissions
- ✅ Video access tokens expire after 2 hours
- ✅ Domain restrictions prevent unauthorized embedding
- ✅ User authentication required for all video access

## Troubleshooting

### Common Issues:

1. **"Failed to load video"**
   - Check YouTube API key is valid
   - Ensure video is unlisted (not private)
   - Verify domain restrictions

2. **"Authentication required"**
   - User must be logged in
   - Check subscription status if FREE_ACCESS=false

3. **"Access denied from this domain"**
   - Add domain to ALLOWED_DOMAINS
   - Check referrer headers

### Debug Mode:

Enable debug logging by setting:
```env
NEXTAUTH_DEBUG=true
NODE_ENV=development
```
