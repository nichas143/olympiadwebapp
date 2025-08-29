# Google Drive API Setup for Secure PDF Access

This guide explains how to set up Google Drive API with a service account to securely access private PDFs in your Olympiad webapp.

## Step 1: Create Google Cloud Project and Enable Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

## Step 2: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in details:
   - **Service account name**: `olympiad-pdf-access`
   - **Service account ID**: `olympiad-pdf-access`
   - **Description**: `Service account for accessing private PDFs`
4. Click "Create and Continue"
5. Skip "Grant this service account access to project" (click Continue)
6. Skip "Grant users access to this service account" (click Done)

## Step 3: Generate Service Account Key

1. In "Credentials", find your service account
2. Click on the service account email
3. Go to "Keys" tab
4. Click "Add Key" > "Create new key"
5. Choose "JSON" format
6. Download the key file (keep it secure!)

## Step 4: Share Google Drive Folder with Service Account

1. In Google Drive, create a folder for your PDF content (e.g., "Olympiad PDFs")
2. Right-click the folder > "Share"
3. Add the service account email (from step 2) as "Viewer"
4. The email looks like: `olympiad-pdf-access@your-project-id.iam.gserviceaccount.com`

## Step 5: Configure Environment Variables

1. Open your `.env.local` file
2. Add the service account key as a single line JSON string:

```bash
# Google Drive API Configuration
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"olympiad-pdf-access@your-project-id.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/olympiad-pdf-access%40your-project-id.iam.gserviceaccount.com"}
```

⚠️ **Important**: Make sure to escape any newlines and quotes in the JSON properly.

## Step 6: Upload PDFs to Shared Folder

1. Upload your PDF content to the shared Google Drive folder
2. Get the sharing URL for each PDF (Right-click > "Get link")
3. Update your content database with these Google Drive URLs

## Step 7: Update Content URLs

Your Google Drive URLs should look like:
```
https://drive.google.com/file/d/1ABC123_FILE_ID_HERE_XYZ/view?usp=sharing
```

The system will automatically extract the file ID and access it securely through the API.

## How It Works

1. **User requests PDF**: PDF viewer detects Google Drive URL
2. **Extract File ID**: System extracts file ID from the URL
3. **API Authentication**: Service account authenticates with Google Drive API
4. **Secure Access**: PDF content is streamed through your app's API
5. **Protected Viewing**: Users see PDF only through your secured viewer

## Security Features

- ✅ **Private PDFs**: Files remain private in Google Drive
- ✅ **Authenticated Access**: Only logged-in users can access PDFs
- ✅ **No Direct Links**: Users never get direct Google Drive URLs
- ✅ **Download Prevention**: Multiple layers prevent downloading
- ✅ **Audit Trail**: All access goes through your application logs

## Testing

After setup, test with a sample PDF:
1. Upload a PDF to your shared folder
2. Get the Google Drive URL
3. Add it to your content
4. Try accessing it through your app

## Troubleshooting

**"Authentication required" error**:
- Check that GOOGLE_SERVICE_ACCOUNT_KEY is properly set
- Verify the JSON format is correct

**"File not found" error**:
- Ensure the service account has access to the folder
- Check that the file ID is correctly extracted from the URL

**"Failed to load PDF" error**:
- Verify Google Drive API is enabled
- Check service account permissions
- Ensure the file is actually a PDF

## Production Deployment

For production environments:
1. Use environment variables in your hosting platform
2. Never commit the service account key to version control
3. Consider using secret management services
4. Monitor API usage and quotas
