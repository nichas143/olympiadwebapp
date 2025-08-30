'use client'

import { useState, useRef, useEffect } from 'react'

// YouTube API type declarations
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}
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
  console.log('VideoPlayer render:', { 
    isOpen, 
    videoUrl, 
    title, 
    contentId, 
    hasOnAttemptUpdate: !!onAttemptUpdate,
    hasAttempted,
    initialAttemptStatus 
  })
  
  // State for secure video handling
  const [secureVideoUrl, setSecureVideoUrl] = useState<string>('')
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState<string>('')

  // YouTube player tracking
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null)
  const [watchTime, setWatchTime] = useState(0)
  const progressCheckInterval = useRef<NodeJS.Timeout | null>(null)
  const isTrackingStarted = useRef<boolean>(false)
  const hasCalledAttemptUpdate = useRef<boolean>(false)

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
    if (isOpen && contentId) {
      // Reset attempted status based on initialAttemptStatus when video opens
      setHasAttempted(initialAttemptStatus)
      hasCalledAttemptUpdate.current = false
      console.log('Video player opened for contentId:', contentId, 'initialAttemptStatus:', initialAttemptStatus)
    }
  }, [isOpen, contentId, initialAttemptStatus])

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
      setWatchTime(0)
      
      // Clear any progress tracking intervals
      if (progressCheckInterval.current) {
        clearInterval(progressCheckInterval.current)
        progressCheckInterval.current = null
      }
      
      // Reset tracking flags
      isTrackingStarted.current = false
      hasCalledAttemptUpdate.current = false
    }
  }, [isOpen, videoUrl, isYouTubeUrl])

  // YouTube iframe API integration for progress tracking
  useEffect(() => {
    if (!isOpen || !isYouTubeUrl || !secureVideoUrl) return

    console.log('🎬 Setting up video tracking for contentId:', contentId)

    // Define fallback tracking function first
    const startFallbackTracking = () => {
      // Prevent multiple tracking instances
      if (isTrackingStarted.current) {
        console.log('⚠️ Tracking already started, skipping duplicate')
        return
      }
      
      console.log('🔄 Starting fallback tracking for video')
      isTrackingStarted.current = true
      
      // Clear any existing interval first
      if (progressCheckInterval.current) {
        clearInterval(progressCheckInterval.current)
        progressCheckInterval.current = null
      }
      
      // Primary tracking: check if user is still viewing the video every 3 seconds
      progressCheckInterval.current = setInterval(() => {
        if (isOpen && contentId && onAttemptUpdate) {
          setWatchTime(prev => {
            const newTime = prev + 3
            console.log('⏱️ Video tracking - watch time:', newTime, 'seconds')
            
            // Mark as attempted after 10 seconds (only if not already attempted)
            if (newTime >= 10 && !hasAttempted && !hasCalledAttemptUpdate.current) {
              console.log('🎯 Video watched for 10+ seconds, marking as attempted')
              setHasAttempted(true)
              hasCalledAttemptUpdate.current = true
              
              // Use setTimeout to avoid React render cycle issues
              setTimeout(() => {
                onAttemptUpdate(contentId, true)
              }, 0)
              
              // Clear interval once attempted
              if (progressCheckInterval.current) {
                clearInterval(progressCheckInterval.current)
                progressCheckInterval.current = null
              }
            }
            return newTime
          })
        } else {
          console.log('⏹️ Video tracking stopped - conditions not met')
        }
      }, 3000) // Check every 3 seconds for faster response
    }

    // Always start fallback tracking immediately as primary method
    // This ensures tracking works regardless of YouTube API status
    if (contentId && onAttemptUpdate) {
      console.log('▶️ Starting immediate fallback tracking (primary method)')
      startFallbackTracking()
    }

    // Load YouTube iframe API as secondary enhancement
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializeYouTubePlayer()
        return
      }

      // Load YouTube API if not already loaded
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
      }

      // Set up callback for when API is ready
      window.onYouTubeIframeAPIReady = initializeYouTubePlayer
    }

    const initializeYouTubePlayer = () => {
      // Wait a bit for iframe to be ready
      setTimeout(() => {
        const iframeId = `youtube-player-${contentId || 'default'}`
        const iframe = document.getElementById(iframeId)
        
        if (iframe && window.YT && window.YT.Player) {
          try {
            const player = new window.YT.Player(iframeId, {
              events: {
                onStateChange: handleYouTubeStateChange,
                onReady: handleYouTubeReady
              }
            })
            setYoutubePlayer(player)
            console.log('YouTube player initialized successfully')
          } catch (error) {
            console.error('Error initializing YouTube player:', error)
            // Fallback to interval-based tracking
            startFallbackTracking()
          }
        } else {
          console.log('YouTube API not ready or iframe not found, using fallback tracking')
          // Fallback to interval-based tracking
          startFallbackTracking()
        }
      }, 1500) // Increased timeout to ensure iframe is fully loaded
    }

    loadYouTubeAPI()

    return () => {
      if (progressCheckInterval.current) {
        clearInterval(progressCheckInterval.current)
        progressCheckInterval.current = null
      }
      isTrackingStarted.current = false
      hasCalledAttemptUpdate.current = false
    }
  }, [isOpen, isYouTubeUrl, secureVideoUrl, contentId])

  const handleYouTubeReady = (event: any) => {
    console.log('YouTube player ready')
  }

  const handleYouTubeStateChange = (event: any) => {
    console.log('YouTube state change:', event.data, 'contentId:', contentId, 'hasAttempted:', hasAttempted)
    
    if (!contentId || !onAttemptUpdate || hasAttempted) {
      console.log('Skipping state change handling - missing data or already attempted')
      return
    }

    // YouTube player states:
    // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    
    if (event.data === 1) { // Playing
      console.log('YouTube video started playing - starting progress tracking')
      
      // Start tracking watch time
      if (!progressCheckInterval.current) {
        progressCheckInterval.current = setInterval(() => {
          if (youtubePlayer && youtubePlayer.getCurrentTime) {
            try {
              const currentTime = youtubePlayer.getCurrentTime()
              console.log('YouTube current time:', currentTime)
              
              if (currentTime >= 10 && !hasCalledAttemptUpdate.current) {
                console.log('🎯 Video watched for 10+ seconds via YouTube API, marking as attempted')
                setHasAttempted(true)
                hasCalledAttemptUpdate.current = true
                
                // Use setTimeout to avoid React render cycle issues
                setTimeout(() => {
                  onAttemptUpdate(contentId, true)
                }, 0)
                
                // Clear interval once attempted
                if (progressCheckInterval.current) {
                  clearInterval(progressCheckInterval.current)
                  progressCheckInterval.current = null
                }
              }
            } catch (error) {
              console.error('Error getting YouTube current time:', error)
            }
          }
        }, 2000) // Check every 2 seconds
      }
    } else if (event.data === 2 || event.data === 0) { // Paused or ended
      // Keep tracking but don't clear interval yet
      console.log('YouTube video paused/ended, state:', event.data)
    }
  }

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
            {(hasAttempted || initialAttemptStatus) && (
              <Chip
                startContent={<CheckCircleIcon className="h-4 w-4" />}
                color="success"
                variant="flat"
                size="sm"
              >
                Attempted
              </Chip>
            )}
            {!hasAttempted && !initialAttemptStatus && watchTime > 0 && (
              <Chip
                color="warning"
                variant="flat"
                size="sm"
              >
                Watching... {Math.floor(watchTime)}s
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
                    id={`youtube-player-${contentId || 'default'}`}
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
