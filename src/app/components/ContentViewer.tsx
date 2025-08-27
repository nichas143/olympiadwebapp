'use client'

import { useState } from 'react'
import VideoPlayer from './VideoPlayer'
import PDFViewer from './PDFViewer'
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
  }
  onProgressUpdate?: (contentId: string, progressPercentage: number, timeSpent: number) => void
}

export default function ContentViewer({ 
  isOpen, 
  onClose, 
  content, 
  onProgressUpdate 
}: ContentViewerProps) {
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [showPDFViewer, setShowPDFViewer] = useState(false)

  const handleProgressUpdate = (progressPercentage: number, timeSpent: number) => {
    if (onProgressUpdate) {
      onProgressUpdate(content._id, progressPercentage, timeSpent)
    }
  }

  const handleOpenContent = () => {
    if (!content.videoLink) {
      return
    }

    switch (content.contentType) {
      case 'video':
        setShowVideoPlayer(true)
        break
      case 'pdf':
        setShowPDFViewer(true)
        break
      case 'link':
      case 'testpaperLink':
        // Open external links in new tab
        window.open(content.videoLink, '_blank')
        onClose()
        break
    }
  }

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

  return (
    <>
      {/* Main Content Selector Modal */}
      <Modal 
        isOpen={isOpen && !showVideoPlayer && !showPDFViewer} 
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

      {/* Video Player Modal */}
      <VideoPlayer
        isOpen={showVideoPlayer}
        onClose={() => {
          setShowVideoPlayer(false)
          onClose()
        }}
        videoUrl={content.videoLink || ''}
        title={content.concept}
        description={`${content.chapter} • ${content.topic} • ${content.unit}`}
        onProgressUpdate={handleProgressUpdate}
      />

      {/* PDF Viewer Modal */}
      <PDFViewer
        isOpen={showPDFViewer}
        onClose={() => {
          setShowPDFViewer(false)
          onClose()
        }}
        pdfUrl={content.videoLink || ''}
        title={content.concept}
        description={`${content.chapter} • ${content.topic} • ${content.unit}`}
        onProgressUpdate={handleProgressUpdate}
      />
    </>
  )
}
