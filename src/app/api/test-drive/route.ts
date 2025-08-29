import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import googleDriveService from '@/lib/googleDrive'

export async function GET(_request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only allow admins to test this endpoint
    if (!['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Test the Google Drive service initialization
    try {
      // Try to validate a dummy file ID to test authentication
      // This will test the service account setup without accessing actual files
      const testFileId = "test123" // This will fail but show us if auth works
      
      try {
        await googleDriveService.getFileMetadata(testFileId)
      } catch (error: any) {
        // We expect this to fail, but the error message will tell us about auth
        const errorMessage = error.message || 'Unknown error'
        
        if (errorMessage.includes('invalid_grant') || errorMessage.includes('private_key')) {
          return NextResponse.json({
            success: false,
            error: 'Service account key format is invalid',
            details: 'Check your GOOGLE_SERVICE_ACCOUNT_KEY format in .env.local'
          })
        }
        
        if (errorMessage.includes('File not found') || errorMessage.includes('does not exist')) {
          return NextResponse.json({
            success: true,
            message: 'Google Drive API connection successful!',
            details: 'Service account authentication is working correctly'
          })
        }
        
        return NextResponse.json({
          success: false,
          error: 'Google Drive API error',
          details: errorMessage
        })
      }
      
    } catch (initError: any) {
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize Google Drive service',
        details: initError.message || 'Check your service account configuration'
      })
    }

  } catch (error: any) {
    console.error('Test Drive API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message
    }, { status: 500 })
  }
}
