import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { google } from 'googleapis'

export async function GET(_request: NextRequest) {
  try {
    // Check if user is authenticated (any user can test this)
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required - please log in' },
        { status: 401 }
      )
    }

    // Initialize Google Drive with service account
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    if (!serviceAccountKey) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_SERVICE_ACCOUNT_KEY not found in environment'
      })
    }

    const credentials = JSON.parse(serviceAccountKey)
    const googleAuth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    })

    const drive = google.drive({ version: 'v3', auth: googleAuth })

    // List files that the service account can access
    const response = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType, webViewLink, owners)',
      q: "trashed=false"
    })

    return NextResponse.json({
      success: true,
      message: 'Service account can access Google Drive',
      accessibleFiles: response.data.files?.length || 0,
      files: response.data.files?.map(file => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        isPdf: file.mimeType === 'application/pdf'
      })) || [],
      instructions: 'If you see 0 files, you need to share a folder with your service account email: olympiad-pdf-access@stasa-424303.iam.gserviceaccount.com'
    })

  } catch (error: any) {
    console.error('Drive folder test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to test Drive access',
      details: error.message
    }, { status: 500 })
  }
}
