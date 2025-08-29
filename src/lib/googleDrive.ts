import { google } from 'googleapis'
import { Readable } from 'stream'

// Google Drive service for accessing private PDFs
class GoogleDriveService {
  private drive: any // eslint-disable-line @typescript-eslint/no-explicit-any
  private auth: any // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor() {
    this.initializeAuth()
  }

  private initializeAuth() {
    try {
      // Use service account credentials from environment variables
      const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
      
      if (!serviceAccountKey) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set')
      }

      const credentials = JSON.parse(serviceAccountKey)
      
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.readonly']
      })

      this.drive = google.drive({ version: 'v3', auth: this.auth })
    } catch (error) {
      console.error('Failed to initialize Google Drive service:', error)
      throw error
    }
  }

  /**
   * Extract file ID from various Google Drive URL formats
   */
  extractFileId(url: string): string | null {
    // Handle different Google Drive URL formats
    const patterns = [
      /\/d\/([a-zA-Z0-9-_]+)/,  // /d/FILE_ID
      /id=([a-zA-Z0-9-_]+)/,    // ?id=FILE_ID
      /file\/d\/([a-zA-Z0-9-_]+)/ // /file/d/FILE_ID
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return null
  }

  /**
   * Get file metadata from Google Drive
   */
  async getFileMetadata(fileId: string) {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'id,name,mimeType,size,webViewLink,webContentLink'
      })

      return response.data
    } catch (error) {
      console.error('Error getting file metadata:', error)
      throw new Error('Failed to access file. File may be private or does not exist.')
    }
  }

  /**
   * Get file content as a stream
   */
  async getFileStream(fileId: string): Promise<Readable> {
    try {
      const response = await this.drive.files.get({
        fileId,
        alt: 'media'
      }, {
        responseType: 'stream'
      })

      return response.data
    } catch (error) {
      console.error('Error getting file stream:', error)
      throw new Error('Failed to download file content.')
    }
  }

  /**
   * Get file content as buffer
   */
  async getFileBuffer(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get({
        fileId,
        alt: 'media'
      }, {
        responseType: 'arraybuffer'
      })

      return Buffer.from(response.data)
    } catch (error) {
      console.error('Error getting file buffer:', error)
      throw new Error('Failed to download file content.')
    }
  }

  /**
   * Check if file is accessible and is a PDF
   */
  async validatePdfFile(fileId: string): Promise<boolean> {
    try {
      const metadata = await this.getFileMetadata(fileId)
      return metadata.mimeType === 'application/pdf'
    } catch (_error) {
      return false
    }
  }

  /**
   * Generate a secure temporary URL for PDF viewing
   * This creates a data URL that can be used in iframes
   */
  async generateSecureViewUrl(fileId: string): Promise<string> {
    try {
      const buffer = await this.getFileBuffer(fileId)
      const base64Data = buffer.toString('base64')
      return `data:application/pdf;base64,${base64Data}`
    } catch (error) {
      console.error('Error generating secure view URL:', error)
      throw error
    }
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService()
export default googleDriveService
