'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import VideoPlayer from './VideoPlayer'

const SecurePDFViewer = dynamic(() => import('./SecurePDFViewer'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96"><div>Loading PDF Viewer...</div></div>
})
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody } from "@heroui/react"
import { LinkIcon, DocumentIcon, PlayCircleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

interface ContentViewerProps {
  isOpen: boolean
  onClose: () => void
  content: {
    _id: string
    title: string
    description: string
    contentType: 'pdf' | 'video' | 'link' | 'testpaperLink'
    videoLink?: string | null
    concept: string
    chapter: string
    topic: string
    unit: string
    attemptStatus?: 'attempted' | 'not_attempted'
  }
  onAttemptUpdate?: (contentId: string, attempted: boolean) => void
}

type ViewerMode = 'selector' | 'video' | 'pdf'

export default function ContentViewer({ 
  isOpen, 
  onClose, 
  content, 
  onAttemptUpdate 
}: ContentViewerProps) {
  const [viewerMode, setViewerMode] = useState<ViewerMode>('selector')
  const [pendingAttemptUpdate, setPendingAttemptUpdate] = useState<{contentId: string, attempted: boolean} | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setViewerMode('selector')
      
      // Send any pending attempt updates when modal closes
      if (pendingAttemptUpdate && onAttemptUpdate) {
        console.log('Sending pending attempt update on modal close:', pendingAttemptUpdate)
        onAttemptUpdate(pendingAttemptUpdate.contentId, pendingAttemptUpdate.attempted)
        setPendingAttemptUpdate(null)
      }
    }
  }, [isOpen, pendingAttemptUpdate, onAttemptUpdate])

  const handleAttemptUpdate = useCallback((contentId: string, attempted: boolean) => {
    console.log('Content marked as attempted, storing for later:', contentId)
    
    // Store the attempt update for when the modal closes instead of updating parent immediately
    // This completely prevents parent re-renders while modal is open
    setPendingAttemptUpdate({ contentId, attempted })
  }, [])

  const handleOpenContent = useCallback(() => {
    if (!content.videoLink) {
      console.log('Content has no videoLink:', content)
      return
    }

    console.log('Opening content:', {
      contentType: content.contentType,
      videoLink: content.videoLink,
      contentId: content._id
    })

    switch (content.contentType) {
      case 'video':
        console.log('Setting viewer mode to video')
        setViewerMode('video')
        break
      case 'pdf':
        console.log('Setting viewer mode to pdf')
        setViewerMode('pdf')
        break
      case 'link':
      case 'testpaperLink':
        console.log('Opening external link:', content.videoLink)
        // Open external links in new tab
        window.open(content.videoLink, '_blank')
        // For external links, we can mark as attempted without causing issues
        if (onAttemptUpdate) {
          onAttemptUpdate(content._id, true)
        }
        onClose()
        break
      default:
        console.log('Unknown content type:', content.contentType)
    }
  }, [content, onAttemptUpdate, onClose])

  const handleCloseViewer = useCallback(() => {
    console.log('Closing viewer, returning to selector')
    setViewerMode('selector')
    onClose()
  }, [onClose])

  const getContentTypeIcon = () => {
    switch (content.contentType) {
      case 'video':
        return <PlayCircleIcon className="h-8 w-8 text-blue-600" />
      case 'pdf':
        return <DocumentIcon className="h-8 w-8 text-red-600" />
      case 'link':
      case 'testpaperLink':
        return <LinkIcon className="h-8 w-8 text-green-600" />
      default:
        return <DocumentIcon className="h-8 w-8 text-gray-600" />
    }
  }

  const getContentTypeText = () => {
    switch (content.contentType) {
      case 'video':
        return 'Video Content'
      case 'pdf':
        return 'PDF Document'
      case 'link':
        return 'External Link'
      case 'testpaperLink':
        return 'Test Paper'
      default:
        return 'Content'
    }
  }

  const getActionButtonText = () => {
    switch (content.contentType) {
      case 'video':
        return 'Watch Video'
      case 'pdf':
        return 'View PDF'
      case 'link':
        return 'Open Link'
      case 'testpaperLink':
        return 'View Test Paper'
      default:
        return 'Open Content'
    }
  }

  // Debug logging
  console.log('ContentViewer render state:', {
    isOpen,
    viewerMode,
    contentType: content.contentType
  })

  // If not open, don't render anything
  if (!isOpen) {
    return null
  }

  // Render based on viewer mode
  switch (viewerMode) {
    case 'video':
      console.log('Rendering VideoPlayer')
      return (
        <VideoPlayer
          isOpen={true}
          onClose={handleCloseViewer}
          videoUrl={content.videoLink || ''}
          title={content.concept}
          description={`${content.chapter} • ${content.topic} • ${content.unit}`}
          contentId={content._id}
          initialAttemptStatus={content.attemptStatus === 'attempted'}
          onAttemptUpdate={handleAttemptUpdate}
        />
      )

    case 'pdf':
      console.log('Rendering SecurePDFViewer')
      return (
        <SecurePDFViewer
          isOpen={true}
          onClose={handleCloseViewer}
          pdfUrl={content.videoLink || ''}
          title={content.concept}
          description={`${content.chapter} • ${content.topic} • ${content.unit}`}
          contentId={content._id}
          initialAttemptStatus={content.attemptStatus === 'attempted'}
          onAttemptUpdate={handleAttemptUpdate}
        />
      )

    case 'selector':
    default:
      console.log('Rendering selector modal')
      return (
        <Modal 
          isOpen={true} 
          onClose={onClose}
          size="2xl"
        >
          <ModalContent>
            <ModalHeader>
              <div className="flex items-center gap-3">
                {getContentTypeIcon()}
                <div>
                  <h3 className="text-xl font-semibold">{content.concept}</h3>
                  <p className="text-sm text-gray-500">{getContentTypeText()}</p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Card>
                  <CardBody>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Unit:</span>
                        <span className="ml-2 text-sm">{content.unit}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Chapter:</span>
                        <span className="ml-2 text-sm">{content.chapter}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Topic:</span>
                        <span className="ml-2 text-sm">{content.topic}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Content Type:</span>
                        <span className="ml-2 text-sm">{content.contentType}</span>
                      </div>
                      {content.videoLink && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">URL:</span>
                          <span className="ml-2 text-sm text-blue-600 break-all">{content.videoLink}</span>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{content.description}</p>
                </div>
                
                {!content.videoLink && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardBody>
                      <p className="text-orange-800 text-sm">
                        ⚠️ Content link is not available. Please contact your instructor.
                      </p>
                    </CardBody>
                  </Card>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleOpenContent}
                isDisabled={!content.videoLink}
                startContent={
                  content.contentType === 'link' || content.contentType === 'testpaperLink' ? 
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" /> : 
                    undefined
                }
              >
                {getActionButtonText()}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )
  }
}
