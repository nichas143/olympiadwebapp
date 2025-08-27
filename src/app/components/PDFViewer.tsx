'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, Spinner, Chip } from "@heroui/react"
import { DocumentIcon, ArrowDownTrayIcon, ArrowsPointingOutIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
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
  
  // Convert Google Drive share links to embed format
  const getEmbedUrl = (url: string) => {
    // Handle Google Drive links
    if (url.includes('drive.google.com')) {
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/)
      if (fileIdMatch) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`
      }
    }
    
    // Handle other cloud storage providers
    if (url.includes('dropbox.com')) {
      return url.replace('?dl=0', '').replace('dropbox.com', 'dropbox.com').replace('/s/', '/scl/fi/') + '?rlkey=your_key&raw=1'
    }
    
    // For direct PDF URLs
    return url
  }

  const isGoogleDrive = pdfUrl.includes('drive.google.com')
  const embedUrl = getEmbedUrl(pdfUrl)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setError(null)
      
      // Mark as attempted when PDF opens
      if (contentId && !hasAttempted) {
        ProgressTracker.markAsAttempted(contentId)
        setHasAttempted(true)
        if (onAttemptUpdate) {
          onAttemptUpdate(contentId, true)
        }
      }
    }
  }, [isOpen, contentId, hasAttempted, onAttemptUpdate])

  const handleDownload = () => {
    // For Google Drive, create download link
    if (isGoogleDrive) {
      const fileIdMatch = pdfUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
      if (fileIdMatch) {
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`
        window.open(downloadUrl, '_blank')
        return
      }
    }
    
    // For direct URLs, try to download
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = title + '.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
                onPress={handleDownload}
                title="Download PDF"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </Button>
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
                  <Button color="primary" onPress={handleDownload}>
                    Download PDF instead
                  </Button>
                </div>
              </div>
            )}
            
            {isGoogleDrive ? (
              <iframe
                src={embedUrl}
                className={`w-full h-[600px] border rounded-lg ${isLoading ? 'hidden' : ''}`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false)
                  setError('PDF could not be loaded. Please try downloading it instead.')
                }}
                title={title}
              />
            ) : (
              <div className="relative">
                <iframe
                  src={`${embedUrl}#view=FitH`}
                  className={`w-full h-[600px] border rounded-lg ${isLoading ? 'hidden' : ''}`}
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false)
                    setError('PDF could not be loaded. Please try downloading it instead.')
                  }}
                  title={title}
                />
                
                {/* PDF Controls (for direct PDFs) */}
                {!isLoading && !error && (
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
          <Button color="primary" onPress={handleDownload}>
            Download PDF
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
