'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, Spinner, Chip } from "@heroui/react"
import { DocumentIcon, ArrowsPointingOutIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import ProgressTracker from './ProgressTracker'

interface PDFViewerProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
  title: string
  description?: string
  contentId?: string
  onAttemptUpdate?: (contentId: string, attempted: boolean) => void
}

export default function PDFViewer({ 
  isOpen, 
  onClose, 
  pdfUrl, 
  title, 
  description,
  contentId,
  onAttemptUpdate 
}: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasAttempted, setHasAttempted] = useState(false)
  const [scale, setScale] = useState(1.0)
  
  // Convert various PDF sources to secure embed URLs
  const getEmbedUrl = async (url: string) => {
    // Handle Google Drive links through our secure API
    if (url.includes('drive.google.com')) {
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/)
      if (fileIdMatch) {
        const fileId = fileIdMatch[1]
        try {
          // Use our secure API to get the PDF
          const response = await fetch(`/api/pdf/secure/${fileId}`)
          if (response.ok) {
            const data = await response.json()
            return data.data.secureUrl
          } else {
            throw new Error('Failed to access secure PDF')
          }
        } catch (error) {
          console.error('Error accessing secure PDF:', error)
          // Fallback to direct stream endpoint
          return `/api/pdf/${fileId}`
        }
      }
    }
    
    // Handle other cloud storage providers
    if (url.includes('dropbox.com')) {
      return url.replace('?dl=0', '').replace('dropbox.com', 'dropbox.com').replace('/s/', '/scl/fi/') + '?rlkey=your_key&raw=1'
    }
    
    // For direct PDF URLs, use them as-is
    return url
  }

  const [embedUrl, setEmbedUrl] = useState<string>('')
  const isGoogleDrive = pdfUrl.includes('drive.google.com')

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setError(null)
      
      // Get the embed URL (async for Google Drive)
      const loadEmbedUrl = async () => {
        try {
          const url = await getEmbedUrl(pdfUrl)
          setEmbedUrl(url)
        } catch (error) {
          console.error('Error loading embed URL:', error)
          setError('Failed to load PDF. Please try again.')
          setIsLoading(false)
        }
      }
      
      loadEmbedUrl()
      
      // Mark as attempted when PDF opens
      if (contentId && !hasAttempted) {
        ProgressTracker.markAsAttempted(contentId)
        setHasAttempted(true)
        if (onAttemptUpdate) {
          onAttemptUpdate(contentId, true)
        }
      }
      
      // Prevent keyboard shortcuts for save/print
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
          if (e.key === 's' || e.key === 'p') {
            e.preventDefault()
            e.stopPropagation()
          }
        }
      }
      
      document.addEventListener('keydown', handleKeyDown)
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, pdfUrl, contentId, hasAttempted, onAttemptUpdate])



  const handleFullscreen = () => {
    window.open(embedUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="5xl"
      classNames={{
        wrapper: "z-[60]",
        backdrop: "z-[59]",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DocumentIcon className="h-5 w-5" />
                {title}
              </h3>
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasAttempted && (
                <Chip
                  startContent={<CheckCircleIcon className="h-4 w-4" />}
                  color="success"
                  variant="flat"
                  size="sm"
                >
                  Attempted
                </Chip>
              )}

              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={handleFullscreen}
                title="Open in new window"
              >
                <ArrowsPointingOutIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="relative w-full">
            {isLoading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="mt-4 text-gray-600">Loading PDF...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load PDF</h3>
                  <p className="text-gray-500 mb-4">{error}</p>
                  <p className="text-gray-500">Please try refreshing the page or contact support if the issue persists.</p>
                </div>
              </div>
            )}
            
            {embedUrl && (
              <>
                {isGoogleDrive || embedUrl.startsWith('data:') ? (
                  <iframe
                    src={embedUrl}
                    className={`w-full h-[600px] border rounded-lg ${isLoading ? 'hidden' : ''}`}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                      setIsLoading(false)
                      setError('PDF could not be loaded. Please try refreshing the page.')
                    }}
                    title={title}
                    sandbox="allow-same-origin allow-scripts"
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ pointerEvents: 'auto' }}
                  />
                ) : (
                  <div className="relative">
                    <iframe
                      src={`${embedUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                      className={`w-full h-[600px] border rounded-lg ${isLoading ? 'hidden' : ''}`}
                      onLoad={() => setIsLoading(false)}
                      onError={() => {
                        setIsLoading(false)
                        setError('PDF could not be loaded. Please try refreshing the page.')
                      }}
                      title={title}
                      sandbox="allow-same-origin allow-scripts"
                      onContextMenu={(e) => e.preventDefault()}
                      style={{ pointerEvents: 'auto' }}
                    />
                    
                    {/* PDF Controls (for direct PDFs) */}
                    {!isLoading && !error && !embedUrl.startsWith('data:') && (
                      <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-lg p-2 flex items-center gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => setScale(scale * 0.9)}
                          isDisabled={scale <= 0.5}
                        >
                          -
                        </Button>
                        <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => setScale(scale * 1.1)}
                          isDisabled={scale >= 2.0}
                        >
                          +
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Attempt Status Summary */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Content Status</span>
                <Chip
                  startContent={hasAttempted ? <CheckCircleIcon className="h-4 w-4" /> : undefined}
                  color={hasAttempted ? "success" : "default"}
                  variant="flat"
                  size="sm"
                >
                  {hasAttempted ? 'Attempted' : 'Not Attempted'}
                </Chip>
              </div>
            </CardBody>
          </Card>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>

        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
