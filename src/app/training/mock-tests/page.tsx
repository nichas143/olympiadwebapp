'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardBody, CardHeader, Button, Select, SelectItem, Chip, Badge } from "@heroui/react"
import { AcademicCapIcon, ClockIcon, BookOpenIcon, CheckCircleIcon, DocumentTextIcon, PlayCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
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
  level: string
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

export default function MockTests() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedUnit, setSelectedUnit] = useState<string>('all')
  const [selectedContent, setSelectedContent] = useState<ContentWithAttempt | null>(null)
  const [showContentViewer, setShowContentViewer] = useState(false)

  // Use cached content hook for mock tests
  const { content, loading, error, refetch, lastUpdated } = useCachedContent({
    docCategory: 'MockTest',
    unit: selectedUnit !== 'all' ? selectedUnit : undefined,
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

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircleIcon className="h-5 w-5" />
      case 'pdf': return <DocumentTextIcon className="h-5 w-5" />
      case 'link': return <BookOpenIcon className="h-5 w-5" />
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

  const handleContentAction = (item: ContentWithAttempt) => {
    setSelectedContent(item)
    setShowContentViewer(true)
  }

  const handleAttemptUpdate = async (contentId: string, attempted: boolean) => {
    // Add a delay to prevent immediate re-render that resets ContentViewer state
    // This allows the PDF/Video viewer to stay open
    setTimeout(() => {
      refetch()
    }, 500)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mock tests...</p>
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
          <div className="text-red-600 text-xl mb-4">Error loading mock tests</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Mock Tests</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive mock tests to assess your preparation level for Olympiad competitions
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
        <div className="mb-6">
          <Select
            label="Filter by Unit"
            placeholder="All Units"
            selectedKeys={[selectedUnit]}
            onSelectionChange={(keys) => setSelectedUnit(Array.from(keys)[0] as string)}
            className="max-w-xs"
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
        </div>

        {/* Mock Tests Grid */}
        {content.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mock tests found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later for new mock tests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <Card key={item._id} className="hover:shadow-lg transition-shadow" isPressable onPress={() => handleContentAction(item)}>
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
                        color="secondary"
                        variant="flat"
                      >
                        Mock Test
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
                          Completed
                        </Chip>
                      ) : (
                        <Chip
                          size="sm"
                          color="danger"
                          variant="solid"
                          startContent={<XCircleIcon className="h-3 w-3" />}
                        >
                          Not Started
                        </Chip>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="bg-slate-100">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Chip color="primary" variant="flat" size="sm">{item.unit}</Chip>
                    <Chip color="secondary" variant="flat" size="sm">Mock Test #{item.sequenceNo}</Chip>
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
                        Start Test
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
              unit: selectedContent.unit,
              level: selectedContent.level,
              attemptStatus: selectedContent.attemptStatus
            }}
            onAttemptUpdate={handleAttemptUpdate}
          />
        )}
      </div>
    </div>
  )
}
