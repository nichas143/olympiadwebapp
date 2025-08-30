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
  
  // Extract YouTube video ID and create embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?enablejsapi=1&rel=0&modestbranding=1`
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

  const isYouTubeUrl = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')

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
                <iframe
                  src={getYouTubeEmbedUrl(videoUrl)}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={title}
                />
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
