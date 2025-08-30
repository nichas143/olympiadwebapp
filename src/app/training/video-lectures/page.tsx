'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardBody, CardHeader, Button, Select, SelectItem, Chip, Badge } from "@heroui/react"
import { PlayCircleIcon, ClockIcon, AcademicCapIcon, BookOpenIcon, LinkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import ContentViewer from '@/app/components/ContentViewer'
import { useCachedContent } from '@/hooks/useCachedContent'

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
  const [selectedUnit, setSelectedUnit] = useState<string>('all')
  const [selectedInstructionType, setSelectedInstructionType] = useState<string>('all')
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [showContentViewer, setShowContentViewer] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  // Use cached content hook for video lectures
  const { content, loading, error, refetch, lastUpdated } = useCachedContent({
    contentType: 'video',
    unit: selectedUnit !== 'all' ? selectedUnit : undefined,
    instructionType: selectedInstructionType !== 'all' ? selectedInstructionType : undefined,
    sortBy: 'sequence',
    limit: 100
  })
  
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

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

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircleIcon className="h-5 w-5" />
      case 'pdf': return <BookOpenIcon className="h-5 w-5" />
      case 'link': return <LinkIcon className="h-5 w-5" />
      case 'testpaperLink': return <BookOpenIcon className="h-5 w-5" />
      default: return <AcademicCapIcon className="h-5 w-5" />
    }
  }

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'primary'
      case 'pdf': return 'danger'
      case 'link': return 'success'
      case 'testpaperLink': return 'warning'
      default: return 'default'
    }
  }

  const getInstructionTypeColor = (type: string) => {
    return type === 'conceptDiscussion' ? 'primary' : 'secondary'
  }

  const handleContentAction = (item: Content) => {
    setSelectedContent(item)
    setShowContentViewer(true)
  }

  const handleAttemptUpdate = async (contentId: string, attempted: boolean) => {
    // Refetch content to update attempt status
    refetch()
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
          {lastUpdated && (
            <p className="mt-2 text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error loading video lectures</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Video Lectures</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive video lectures covering all Olympiad topics with expert explanations
          </p>
          {lastUpdated && (
            <p className="mt-1 text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()} • 
              <button 
                onClick={refetch}
                className="ml-2 text-blue-600 hover:text-blue-700 underline"
              >
                Refresh
              </button>
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Filter by Unit"
            placeholder="All Units"
            selectedKeys={[selectedUnit]}
            onSelectionChange={(keys) => setSelectedUnit(Array.from(keys)[0] as string)}
          >
            <SelectItem key="all" className='text-black'>All Units</SelectItem>
            <SelectItem key="Algebra" className='text-black'>Algebra</SelectItem>
            <SelectItem key="Geometry" className='text-black'>Geometry</SelectItem>
            <SelectItem key="Number Theory" className='text-black'>Number Theory</SelectItem>
            <SelectItem key="Combinatorics" className='text-black'>Combinatorics</SelectItem>
            <SelectItem key="Functional Equations" className='text-black'>Functional Equations</SelectItem>
            <SelectItem key="Inequalities" className='text-black'>Inequalities</SelectItem>
            <SelectItem key="Advanced Math" className='text-black'>Advanced Math</SelectItem>
            <SelectItem key="Calculus" className='text-black'>Calculus</SelectItem>
            <SelectItem key="Other" className='text-black'>Other</SelectItem>
          </Select>
          
          <Select
            label="Instruction Type"
            placeholder="All Types"
            selectedKeys={[selectedInstructionType]}
            onSelectionChange={(keys) => setSelectedInstructionType(Array.from(keys)[0] as string)}
          >
            <SelectItem key="all" className='text-black'>All Types</SelectItem>
            <SelectItem key="conceptDiscussion" className='text-black'>Concept Discussion</SelectItem>
            <SelectItem key="problemDiscussion" className='text-black'>Problem Discussion</SelectItem>
          </Select>
        </div>

        {/* Video Lectures Grid */}
        {content.length === 0 ? (
          <div className="text-center py-12">
            <PlayCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No video lectures found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later for new video lectures.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <Card key={item._id} className="hover:shadow-lg transition-shadow" isPressable onPress={() => handleContentAction(item)}>
                {/* VIDEO CONTENT LAYOUT */}
                {item.contentType === 'video' && item.videoLink && getYouTubeVideoId(item.videoLink) ? (
                  <CardHeader className="pb-0 px-3">
                    <div className="relative w-full h-48">
                      <Image
                        src={imageErrors[item._id] 
                          ? `https://img.youtube.com/vi/${getYouTubeVideoId(item.videoLink)}/hqdefault.jpg`
                          : `https://img.youtube.com/vi/${getYouTubeVideoId(item.videoLink)}/maxresdefault.jpg`
                        }
                        alt={item.concept}
                        fill
                        className="object-cover object-center rounded-lg"
                        onError={() => handleImageError(item._id)}
                      />
                      <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                        {formatDuration(item.duration)}
                      </div>
                      <div className="absolute top-2 left-2 flex gap-1">
                        <Chip
                          size="sm"
                          color={getContentTypeColor(item.contentType)}
                          variant="flat"
                          startContent={getContentTypeIcon(item.contentType)}
                        >
                          {item.contentType}
                        </Chip>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Chip
                          size="sm"
                          color={getInstructionTypeColor(item.instructionType)}
                          variant="flat"
                        >
                          {item.instructionType === 'conceptDiscussion' ? 'Concept' : 'Problem'}
                        </Chip>
                      </div>
                      {item.attemptStatus === 'attempted' && (
                        <div className="absolute bottom-2 right-2">
                          <Chip
                            size="sm"
                            color="success"
                            variant="solid"
                            startContent={<CheckCircleIcon className="h-3 w-3" />}
                          >
                            Watched
                          </Chip>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                ) : (
                  /* FALLBACK LAYOUT FOR NON-VIDEO CONTENT */
                  <CardHeader className="pb-4 bg-slate-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <Chip
                          size="sm"
                          color={getContentTypeColor(item.contentType)}
                          variant="flat"
                          startContent={getContentTypeIcon(item.contentType)}
                        >
                          {item.contentType}
                        </Chip>
                        <Chip
                          size="sm"
                          color={getInstructionTypeColor(item.instructionType)}
                          variant="flat"
                        >
                          {item.instructionType === 'conceptDiscussion' ? 'Concept' : 'Problem'}
                        </Chip>
                      </div>
                      <div className="flex items-end gap-10">
                        {item.attemptStatus === 'attempted' ? (
                          <Chip
                            size="sm"
                            color="success"
                            variant="solid"
                            startContent={<CheckCircleIcon className="h-3 w-3" />}
                          >
                            Watched
                          </Chip>
                        ) : (
                          <Chip
                            size="sm"
                            color="warning"
                            variant="solid"
                          >
                            Not Watched
                          </Chip>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                )}
                <CardBody className="bg-slate-100">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Chip color="primary" variant="flat" size="sm">{item.unit}</Chip>
                    <Chip color="secondary" variant="flat" size="sm">Video #{item.sequenceNo}</Chip>
                    {item.noOfProblems && (
                      <Chip color="warning" variant="flat" size="sm">
                        {item.noOfProblems} problems
                      </Chip>
                    )}
                  </div>
                  <h3 className="text-2xl text-slate-800 font-semibold mb-1">{item.concept}</h3>
                  <p className="text-lg text-slate-600 mb-2">{item.chapter} • {item.topic}</p>
                  <p className="text-gray-600 tracking-wide font-light text-sm mb-4 line-clamp-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4" />
                      <span>{formatDuration(item.duration)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        {getContentTypeIcon(item.contentType)}
                        Watch
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
