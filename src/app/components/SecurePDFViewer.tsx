'use client'

import { useState, useEffect, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, Spinner, Chip } from "@heroui/react"
import { DocumentIcon, ArrowsPointingOutIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline'
import ProgressTracker from './ProgressTracker'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

interface SecurePDFViewerProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
  title: string
  description?: string
  contentId?: string
  onAttemptUpdate?: (contentId: string, attempted: boolean) => void
}

export default function SecurePDFViewer({ 
  isOpen, 
  onClose, 
  pdfUrl, 
  title, 
  description,
  contentId,
  onAttemptUpdate 
}: SecurePDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasAttempted, setHasAttempted] = useState(false)
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.2)
  const [pdfFile, setPdfFile] = useState<string | null>(null)

  const isGoogleDrive = pdfUrl.includes('drive.google.com')

  // Get secure PDF file
  const loadSecurePDF = useCallback(async () => {
    if (!pdfUrl) return

    try {
      setIsLoading(true)
      setError(null)
      
      if (isGoogleDrive) {
        const fileIdMatch = pdfUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
        if (fileIdMatch) {
          const fileId = fileIdMatch[1]
          // Use the stream endpoint for react-pdf
          const secureUrl = `/api/pdf/${fileId}`
          setPdfFile(secureUrl)
        }
      } else {
        // For direct PDF URLs
        setPdfFile(pdfUrl)
      }
    } catch (error) {
      console.error('Error loading secure PDF:', error)
      setError('Failed to load PDF. Please try again.')
      setIsLoading(false)
    }
  }, [pdfUrl, isGoogleDrive])

  useEffect(() => {
    if (isOpen) {
      setPageNumber(1)
      setPdfFile(null)
      
      loadSecurePDF()
      
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
        // Add page navigation
        if (e.key === 'ArrowLeft') {
          setPageNumber(prev => Math.max(1, prev - 1))
        } else if (e.key === 'ArrowRight') {
          setPageNumber(prev => Math.min(numPages, prev + 1))
        }
      }
      
      document.addEventListener('keydown', handleKeyDown)
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, pdfUrl, contentId, hasAttempted, onAttemptUpdate, numPages, loadSecurePDF])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setIsLoading(false)
    setError(null)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error)
    setIsLoading(false)
    setError('PDF could not be loaded. Please try refreshing the page.')
  }

  const handleFullscreen = () => {
    if (pdfFile) {
      window.open(pdfFile, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
    }
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset
      return Math.max(1, Math.min(numPages, newPageNumber))
    })
  }

  const changeScale = (newScale: number) => {
    setScale(Math.max(0.5, Math.min(2.0, newScale)))
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
                isDisabled={!pdfFile}
              >
                <ArrowsPointingOutIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="relative w-full">
            {isLoading && !pdfFile && (
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
            
            {pdfFile && !error && (
              <div className="flex flex-col items-center">
                {/* PDF Controls */}
                <div className="flex items-center gap-4 mb-4 p-2 bg-gray-100 rounded-lg">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => changePage(-1)}
                    isDisabled={pageNumber <= 1}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm font-medium min-w-[100px] text-center">
                    Page {pageNumber} of {numPages}
                  </span>
                  
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => changePage(1)}
                    isDisabled={pageNumber >= numPages}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                  
                  <div className="w-px h-6 bg-gray-300"></div>
                  
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => changeScale(scale - 0.1)}
                    isDisabled={scale <= 0.5}
                  >
                    <MagnifyingGlassMinusIcon className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm font-medium min-w-[50px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => changeScale(scale + 0.1)}
                    isDisabled={scale >= 2.0}
                  >
                    <MagnifyingGlassPlusIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* PDF Document */}
                <div 
                  className="border rounded-lg overflow-auto max-h-[600px] flex justify-center"
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ userSelect: 'none' }}
                >
                  <Document
                    file={pdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="flex items-center justify-center h-96 w-full">
                        <div className="text-center">
                          <Spinner size="lg" />
                          <p className="mt-4 text-gray-600">Loading PDF...</p>
                        </div>
                      </div>
                    }
                  >
                    <Page 
                      pageNumber={pageNumber} 
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="shadow-lg"
                      width={800}
                    />
                  </Document>
                </div>
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
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
