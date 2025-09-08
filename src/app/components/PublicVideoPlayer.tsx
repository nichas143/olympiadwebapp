'use client'

import { useState, useRef, useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react"
import { PlayCircleIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline'

interface PublicVideoPlayerProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title: string
  description?: string
}

export default function PublicVideoPlayer({ 
  isOpen, 
  onClose, 
  videoUrl, 
  title, 
  description 
}: PublicVideoPlayerProps) {
  
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState<string>('')
  const [publicEmbedUrl, setPublicEmbedUrl] = useState<string>('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Check if this is a YouTube URL
  const isYouTubeUrl = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')

  // Extract YouTube video ID and create embed URL
  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url?.match(regex)
    return match ? match[1] : null
  }

  // Handle video load
  const handleVideoLoad = () => {
    setVideoLoading(false)
    setVideoError('')
  }

  // Handle video error
  const handleVideoError = () => {
    setVideoLoading(false)
    setVideoError('Failed to load video')
  }

  // Handle play/pause
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  // Handle mute/unmute
  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Handle close
  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setIsPlaying(false)
    onClose()
  }

  // Load public video access when modal opens
  useEffect(() => {
    if (isOpen && isYouTubeUrl) {
      const videoId = getYouTubeVideoId(videoUrl)
      if (videoId) {
        setVideoLoading(true)
        setVideoError('')
        
        // Fetch public video access
        fetch(`/api/video/public/${videoId}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to get video access')
            }
            return response.json()
          })
          .then(data => {
            if (data.success && data.data.embedUrl) {
              setPublicEmbedUrl(data.data.embedUrl)
              setVideoLoading(false)
            } else {
              throw new Error('Invalid video access response')
            }
          })
          .catch(error => {
            console.error('Error fetching public video access:', error)
            setVideoError('Failed to load video. Please try again.')
            setVideoLoading(false)
          })
      }
    }
  }, [isOpen, videoUrl, isYouTubeUrl])

  // If not open, don't render anything
  if (!isOpen) {
    return null
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "p-0",
        header: "p-4 pb-2",
        footer: "p-4 pt-2"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </ModalHeader>
        <ModalBody>
          <div ref={containerRef} className="relative w-full">
            {isYouTubeUrl ? (
              <div className="relative w-full h-0 pb-[56.25%] bg-gray-200 rounded-lg overflow-hidden">
                {videoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading video...</p>
                    </div>
                  </div>
                )}
                {videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <div className="text-center">
                      <p className="text-red-600 mb-4">{videoError}</p>
                      <Button 
                        size="sm" 
                        color="primary" 
                        onPress={() => window.location.reload()}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
                {!videoLoading && !videoError && publicEmbedUrl && (
                  <iframe
                    src={publicEmbedUrl}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={title}
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                )}
              </div>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full rounded-lg"
                  onLoadedMetadata={handleVideoLoad}
                  onError={handleVideoError}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  controls={false}
                  preload="metadata"
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Custom Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handlePlayPause}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                      >
                        {isPlaying ? (
                          <PauseIcon className="h-5 w-5" />
                        ) : (
                          <PlayCircleIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={handleMuteToggle}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                      >
                        {isMuted ? (
                          <SpeakerXMarkIcon className="h-5 w-5" />
                        ) : (
                          <SpeakerWaveIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" variant="light" onPress={handleClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
