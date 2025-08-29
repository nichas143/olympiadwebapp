import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import googleDriveService from '@/lib/googleDrive'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // Check if user is authenticated
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { fileId } = await params
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }

    // Optional: Add user permission checks here
    // You could check if the user has access to this specific content
    // by querying your Content/UserProgress models

    // Validate that the file is a PDF and accessible
    const isValidPdf = await googleDriveService.validatePdfFile(fileId)
    if (!isValidPdf) {
      return NextResponse.json(
        { error: 'File not found or not a valid PDF' },
        { status: 404 }
      )
    }

    // Generate secure data URL
    const secureUrl = await googleDriveService.generateSecureViewUrl(fileId)
    
    // Get file metadata
    const metadata = await googleDriveService.getFileMetadata(fileId)

    return NextResponse.json({
      success: true,
      data: {
        fileId,
        fileName: metadata.name,
        secureUrl,
        mimeType: metadata.mimeType,
        size: metadata.size
      }
    }, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error generating secure PDF URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate secure PDF access' },
      { status: 500 }
    )
  }
}
