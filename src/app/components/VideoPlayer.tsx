'use client'

import { useState, useRef, useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Progress, Card, CardBody } from "@heroui/react"
import { PlayCircleIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'
import ProgressTracker from './ProgressTracker'

interface VideoPlayerProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title: string
  description?: string
  contentId?: string
  onProgressUpdate?: (progressPercentage: number, timeWatched: number) => void
}

export default function VideoPlayer({ 
  isOpen, 
  onClose, 
  videoUrl, 
  title, 
  description,
  contentId,
  onProgressUpdate 
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [watchedSegments, setWatchedSegments] = useState<Array<{ start: number; end: number }>>([])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
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
    const newTime = (clickX / width) * duration
    
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (isOpen && contentId && !sessionStarted) {
      // Start study session when video opens
      ProgressTracker.startSession({
        contentId,
        activityType: 'video_watch',
        sessionStart: new Date(),
        engagementScore: 5,
        device: ProgressTracker.getDeviceType()
      })
      setSessionStarted(true)
    }
  }, [isOpen, contentId, sessionStarted])

  useEffect(() => {
    if (onProgressUpdate && duration > 0) {
      const progressPercentage = (currentTime / duration) * 100
      onProgressUpdate(progressPercentage, currentTime / 60) // Convert to minutes
      
      // Enhanced progress tracking
      if (contentId) {
        ProgressTracker.trackVideoProgress(
          contentId,
          currentTime,
          duration,
          watchedSegments
        )
      }
    }
  }, [currentTime, duration, onProgressUpdate, contentId, watchedSegments])

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      setCurrentTime(current)
      setProgress((current / videoRef.current.duration) * 100)
      
      // Track watched segments
      if (current > 0) {
        const lastSegment = watchedSegments[watchedSegments.length - 1]
        if (!lastSegment || current > lastSegment.end + 5) {
          // New segment if gap is more than 5 seconds
          setWatchedSegments(prev => [...prev, { start: current, end: current }])
        } else {
          // Extend current segment
          setWatchedSegments(prev => 
            prev.map((seg, i) => 
              i === prev.length - 1 ? { ...seg, end: current } : seg
            )
          )
        }
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
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
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
                      style={{ width: `${progress}%` }}
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
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onPress={toggleFullscreen}
                    >
                      <ArrowsPointingOutIcon className="h-5 w-5 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Progress Summary */}
          <Card>
            <CardBody>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Viewing Progress</span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress 
                value={progress} 
                className="mt-2"
                color="primary"
              />
            </CardBody>
          </Card>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="light" 
            onPress={() => {
              // End session when closing
              if (contentId) {
                ProgressTracker.endSession(contentId)
              }
              onClose()
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
