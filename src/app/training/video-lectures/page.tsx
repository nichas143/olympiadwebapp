'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardBody, CardHeader, Button, Select, SelectItem, Chip, Badge } from "@heroui/react"
import { PlayCircleIcon, ClockIcon, AcademicCapIcon, BookOpenIcon, LinkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import ContentViewer from '@/app/components/ContentViewer'

interface Content {
  _id: string
  unit: 'Algebra' | 'Geometry' | 'Number Theory' | 'Combinatorics' | 'Functional Equations' | 'Inequalities' | 'Advanced Math' | 'Calculus' | 'Other'
  chapter: string
  topic: string
  concept: string
  contentType: 'pdf' | 'video' | 'link' | 'testpaperLink'
  instructionType: 'problemDiscussion' | 'conceptDiscussion'
  duration: number
  videoLink?: string | null
  description: string
  sequenceNo: number
  docCategory: 'Learning' | 'MockTest' | 'PracticeSet'
  noOfProblems?: number
  createdAt: string
  updatedAt: string
  isActive: boolean
}

interface ContentWithAttempt extends Content {
  attemptStatus?: 'not_attempted' | 'attempted'
}

export default function VideoLectures() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [content, setContent] = useState<ContentWithAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUnit, setSelectedUnit] = useState<string>('all')
  const [selectedInstructionType, setSelectedInstructionType] = useState<string>('all')
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [showContentViewer, setShowContentViewer] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  
  const fetchContent = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('contentType', 'video')
      params.append('sortBy', 'sequence') // Ensure proper sequence ordering
      
      if (selectedUnit !== 'all') {
        params.append('unit', selectedUnit)
      }
      
      if (selectedInstructionType !== 'all') {
        params.append('instructionType', selectedInstructionType)
      }
      
      const response = await fetch(`/api/content?${params}`)
      if (response.ok) {
        const data = await response.json()
        const contentWithAttempts = await Promise.all(
          data.content.map(async (item: Content) => {
            try {
              const progressResponse = await fetch(`/api/progress?contentId=${item._id}`)
              if (progressResponse.ok) {
                const progressData = await progressResponse.json()
                return {
                  ...item,
                  attemptStatus: progressData.progress?.status || 'not_attempted'
                }
              }
            } catch (error) {
              console.error('Failed to fetch attempt status:', error)
            }
            return {
              ...item,
              attemptStatus: 'not_attempted'
            }
          })
        )
        setContent(contentWithAttempts)
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedUnit, selectedInstructionType])
  
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    fetchContent()
  }, [session, status, router, fetchContent])

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url?.match(regex)
    return match ? match[1] : null
  }

  const getInstructionTypeColor = (type: string) => {
    return type === 'conceptDiscussion' ? 'primary' : 'secondary'
  }

  const handleWatchVideo = (item: Content) => {
    setSelectedContent(item)
    setShowContentViewer(true)
  }

  const handleAttemptUpdate = async (contentId: string, attempted: boolean) => {
    // Update the local state to reflect the attempt status
    setContent(prevContent => 
      prevContent.map(item => 
        item._id === contentId 
          ? { ...item, attemptStatus: attempted ? 'attempted' : 'not_attempted' }
          : item
      )
    )
  }

  const handleImageError = (contentId: string) => {
    setImageErrors(prev => ({ ...prev, [contentId]: true }))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading video lectures...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Video Lectures</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive video tutorials covering all Olympiad topics
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Select Unit"
            placeholder="All Units"
            selectedKeys={[selectedUnit]}
            onSelectionChange={(keys) => setSelectedUnit(Array.from(keys)[0] as string)}
          >
            <SelectItem key="all">All Units</SelectItem>
            <SelectItem key="Algebra">Algebra</SelectItem>
            <SelectItem key="Geometry">Geometry</SelectItem>
            <SelectItem key="Number Theory">Number Theory</SelectItem>
            <SelectItem key="Combinatorics">Combinatorics</SelectItem>
            <SelectItem key="Functional Equations">Functional Equations</SelectItem>
            <SelectItem key="Inequalities">Inequalities</SelectItem>
            <SelectItem key="Advanced Math">Advanced Math</SelectItem>
            <SelectItem key="Calculus">Calculus</SelectItem>
            <SelectItem key="Other">Other</SelectItem>
          </Select>
          
          <Select
            label="Instruction Type"
            placeholder="All Types"
            selectedKeys={[selectedInstructionType]}
            onSelectionChange={(keys) => setSelectedInstructionType(Array.from(keys)[0] as string)}
          >
            <SelectItem key="all">All Types</SelectItem>
            <SelectItem key="conceptDiscussion">Concept Discussion</SelectItem>
            <SelectItem key="problemDiscussion">Problem Discussion</SelectItem>
          </Select>
        </div>

        {/* Quick Access to All Materials */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardBody className="text-center py-6">
              <AcademicCapIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-2">Looking for PDFs, Links, or Test Papers?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Access our complete collection of study materials including PDFs, external links, and practice test papers.
              </p>
              <Button 
                color="primary" 
                variant="flat"
                onPress={() => router.push('/training/study-materials')}
              >
                Browse All Study Materials
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Video Content Grid */}
        {content.length === 0 ? (
          <div className="text-center py-12">
            <PlayCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No video lectures found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later for new video content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <Card key={item._id} className="hover:shadow-lg transition-shadow group" isPressable onPress={() => handleWatchVideo(item)}>
                <CardHeader className="pb-0 px-3">
                  <div className="relative overflow-hidden rounded-lg w-full h-48">
                    {item.videoLink && getYouTubeVideoId(item.videoLink) ? (
                      <>
                        <Image
                          src={imageErrors[item._id] 
                            ? `https://img.youtube.com/vi/${getYouTubeVideoId(item.videoLink)}/hqdefault.jpg`
                            : `https://img.youtube.com/vi/${getYouTubeVideoId(item.videoLink)}/maxresdefault.jpg`
                          }
                          alt={item.concept}
                          fill
                          className="object-cover object-center rounded-lg transition-transform group-hover:scale-105"
                          onError={() => handleImageError(item._id)}
                        />
                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                          <div className="flex items-center justify-center w-16 h-16">
                            <PlayCircleIcon className="h-16 w-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <div className="flex items-center justify-center w-16 h-16">
                          <PlayCircleIcon className="h-16 w-16 text-blue-600" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                      {formatDuration(item.duration)}
                    </div>
                    <div className="absolute top-2 left-2">
                      <Chip
                        size="sm"
                        color={getInstructionTypeColor(item.instructionType)}
                        variant="solid"
                      >
                        {item.instructionType === 'conceptDiscussion' ? 'Concept' : 'Problem'}
                      </Chip>
                    </div>
                    {/* Attempt Status Badge */}
                    {item.attemptStatus === 'attempted' && (
                      <div className="absolute bottom-2 right-2">
                        <Chip
                          size="sm"
                          color="success"
                          variant="solid"
                          startContent={<CheckCircleIcon className="h-3 w-3" />}
                        >
                          Attempted
                        </Chip>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge color="primary" variant="flat">{item.unit}</Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-1 line-clamp-2">{item.concept}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.chapter} • {item.topic}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4" />
                      <span>{formatDuration(item.duration)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <span className="flex items-center gap-1">
                        <PlayCircleIcon className="h-4 w-4" />
                        Watch Now
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
        
        {/* Content Viewer */}
        {selectedContent && (
          <ContentViewer
            isOpen={showContentViewer}
            onClose={() => {
              setShowContentViewer(false)
              setSelectedContent(null)
            }}
            content={{
              _id: selectedContent._id,
              title: selectedContent.concept,
              description: selectedContent.description,
              contentType: selectedContent.contentType,
              videoLink: selectedContent.videoLink,
              concept: selectedContent.concept,
              chapter: selectedContent.chapter,
              topic: selectedContent.topic,
              unit: selectedContent.unit
            }}
            onAttemptUpdate={handleAttemptUpdate}
          />
        )}
      </div>
    </div>
  )
}
