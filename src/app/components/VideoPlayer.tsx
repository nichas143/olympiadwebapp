'use client'

import { useState, useRef, useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, Chip } from "@heroui/react"
import { PlayCircleIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
// import ProgressTracker from './ProgressTracker' // Unused for now

interface VideoPlayerProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title: string
  description?: string
  contentId?: string
  initialAttemptStatus?: boolean
  onAttemptUpdate?: (contentId: string, attempted: boolean) => void
}

export default function VideoPlayer({ 
  isOpen, 
  onClose, 
  videoUrl, 
  title, 
  description,
  contentId,
  initialAttemptStatus = false,
  onAttemptUpdate 
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  // const [isFullscreen, setIsFullscreen] = useState(false) // Unused for now
  const [hasAttempted, setHasAttempted] = useState(initialAttemptStatus)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Debug logging
  console.log('VideoPlayer render:', { isOpen, videoUrl, title, contentId })
  
  // State for secure video handling
  const [secureVideoUrl, setSecureVideoUrl] = useState<string>('')
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState<string>('')

  // Check if this is a YouTube URL
  const isYouTubeUrl = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')

  // Extract YouTube video ID and create embed URL
  const getYouTubeEmbedUrl = async (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    
    if (match) {
      const videoId = match[1]
      
      try {
        // Check if this might be a private/unlisted video requiring secure access
        setVideoLoading(true)
        setVideoError('')
        
        // Try to get secure access first
        const response = await fetch(`/api/video/secure/${videoId}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('Secure video access granted:', data.data.title)
          return data.data.secureEmbedUrl
        } else {
          // Fallback to standard embed for public videos
          console.log('Using standard embed for public video')
          return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`
        }
      } catch (error) {
        console.error('Error accessing secure video:', error)
        setVideoError('Failed to load video. Please try again.')
        // Fallback to standard embed
        return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`
      } finally {
        setVideoLoading(false)
      }
    }
    
    return url
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const newTime = (clickX / width) * videoRef.current.duration
    
    videoRef.current.currentTime = newTime
  }

  // Fullscreen functionality disabled for now
  // const toggleFullscreen = () => {
  //   if (!containerRef.current) return
  //   
  //   if (!document.fullscreenElement) {
  //     containerRef.current.requestFullscreen?.()
  //     setIsFullscreen(true)
  //   } else {
  //     document.exitFullscreen?.()
  //     setIsFullscreen(false)
  //   }
  // }

  // useEffect(() => {
  //   const handleFullscreenChange = () => {
  //     setIsFullscreen(!!document.fullscreenElement)
  //   }
  //   
  //   document.addEventListener('fullscreenchange', handleFullscreenChange)
  //   return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  // }, [])

  useEffect(() => {
    if (isOpen && contentId && !hasAttempted) {
      // Don't mark as attempted immediately when video opens
      console.log('Video player opened')
    }
  }, [isOpen, contentId, hasAttempted, onAttemptUpdate])

  // Load secure video URL when component opens
  useEffect(() => {
    if (isOpen && isYouTubeUrl) {
      const loadSecureVideo = async () => {
        try {
          const secureUrl = await getYouTubeEmbedUrl(videoUrl)
          setSecureVideoUrl(secureUrl)
        } catch (error) {
          console.error('Failed to load secure video:', error)
          setVideoError('Failed to load video')
        }
      }
      
      loadSecureVideo()
    }
    
    // Reset states when closing
    if (!isOpen) {
      setSecureVideoUrl('')
      setVideoError('')
      setVideoLoading(false)
    }
  }, [isOpen, videoUrl, isYouTubeUrl])

  const handleVideoLoad = () => {
    // Video loaded successfully
    console.log('Video loaded successfully')
  }

  const handleTimeUpdate = () => {
    if (videoRef.current && !hasAttempted && contentId && onAttemptUpdate) {
      // Mark as attempted after user watches for 10 seconds
      if (videoRef.current.currentTime >= 10) {
        console.log('Video watched for 10+ seconds, marking as attempted')
        setHasAttempted(true)
        onAttemptUpdate(contentId, true)
      }
    }
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
              <h3 className="text-lg font-semibold">{title}</h3>
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>
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
          </div>
        </ModalHeader>
        <ModalBody>
          <div ref={containerRef} className="relative w-full">
            {isYouTubeUrl ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                {videoLoading && (
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading secure video...</p>
                    </div>
                  </div>
                )}
                {videoError && (
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-red-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-red-600 mb-2">{videoError}</p>
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={() => {
                          setVideoError('')
                          setVideoLoading(true)
                          getYouTubeEmbedUrl(videoUrl).then(url => {
                            setSecureVideoUrl(url)
                            setVideoLoading(false)
                          }).catch(() => {
                            setVideoError('Failed to reload video')
                            setVideoLoading(false)
                          })
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
                {!videoLoading && !videoError && secureVideoUrl && (
                  <iframe
                    src={secureVideoUrl}
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
                  onTimeUpdate={handleTimeUpdate}
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
                  {/* Progress Bar */}
                  <div 
                    className="w-full h-2 bg-gray-600 rounded cursor-pointer mb-3"
                    onClick={handleProgressClick}
                  >
                    <div 
                      className="h-full bg-blue-500 rounded"
                      style={{ width: videoRef.current ? `${(videoRef.current.currentTime / videoRef.current.duration) * 100}%` : '0%' }}
                    />
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={() => {
                          if (videoRef.current) {
                            if (isPlaying) {
                              videoRef.current.pause()
                            } else {
                              videoRef.current.play()
                            }
                          }
                        }}
                      >
                        {isPlaying ? 
                          <PauseIcon className="h-5 w-5 text-white" /> : 
                          <PlayCircleIcon className="h-5 w-5 text-white" />
                        }
                      </Button>
                      
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={() => {
                          if (videoRef.current) {
                            videoRef.current.muted = !isMuted
                            setIsMuted(!isMuted)
                          }
                        }}
                      >
                        {isMuted ? 
                          <SpeakerXMarkIcon className="h-5 w-5 text-white" /> : 
                          <SpeakerWaveIcon className="h-5 w-5 text-white" />
                        }
                      </Button>
                      
                      <span className="text-sm">
                        {videoRef.current ? formatTime(videoRef.current.currentTime) : '0:00'} / {videoRef.current ? formatTime(videoRef.current.duration) : '0:00'}
                      </span>
                    </div>
                    
                    {/* Fullscreen button disabled for now */}
                    {/* <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onPress={toggleFullscreen}
                    >
                      <ArrowsPointingOutIcon className="h-5 w-5 text-white" />
                    </Button> */}
                  </div>
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
          <Button 
            variant="light" 
            onPress={onClose}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
