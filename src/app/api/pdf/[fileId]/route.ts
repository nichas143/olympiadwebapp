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

    // Validate that the file is a PDF and accessible
    const isValidPdf = await googleDriveService.validatePdfFile(fileId)
    if (!isValidPdf) {
      return NextResponse.json(
        { error: 'File not found or not a valid PDF' },
        { status: 404 }
      )
    }

    // Get file content as stream
    const fileStream = await googleDriveService.getFileStream(fileId)
    
    // Get file metadata for proper headers
    const metadata = await googleDriveService.getFileMetadata(fileId)

    // Create response with appropriate headers
    const response = new NextResponse(fileStream as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${metadata.name || 'document.pdf'}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        // Security headers to prevent downloads
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'self'; object-src 'none';",
      }
    })

    return response

  } catch (error) {
    console.error('Error serving PDF:', error)
    return NextResponse.json(
      { error: 'Failed to load PDF' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
