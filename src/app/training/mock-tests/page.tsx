'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardBody, CardHeader, Button, Select, SelectItem, Chip, Badge } from "@heroui/react"
import { AcademicCapIcon, ClockIcon, BookOpenIcon, CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
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

export default function MockTests() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [content, setContent] = useState<ContentWithAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUnit, setSelectedUnit] = useState<string>('all')
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [showContentViewer, setShowContentViewer] = useState(false)
  
  const fetchContent = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('docCategory', 'MockTest')
      params.append('sortBy', 'sequence') // Ensure proper sequence ordering
      
      if (selectedUnit !== 'all') {
        params.append('unit', selectedUnit)
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
  }, [selectedUnit])
  
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

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'pdf':
        return <DocumentTextIcon className="h-6 w-6 text-red-600" />
      case 'video':
        return <AcademicCapIcon className="h-6 w-6 text-blue-600" />
      case 'link':
        return <BookOpenIcon className="h-6 w-6 text-green-600" />
      case 'testpaperLink':
        return <DocumentTextIcon className="h-6 w-6 text-purple-600" />
      default:
        return <DocumentTextIcon className="h-6 w-6 text-gray-600" />
    }
  }

  const getContentTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'pdf':
        return 'danger'
      case 'video':
        return 'primary'
      case 'link':
        return 'success'
      case 'testpaperLink':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const handleStartTest = (item: Content) => {
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mock tests...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Mock Tests</h1>
          <p className="mt-2 text-gray-600">
            Simulate real Olympiad exam conditions with our comprehensive mock tests
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Select
            label="Select Unit"
            placeholder="All Units"
            selectedKeys={[selectedUnit]}
            onSelectionChange={(keys) => setSelectedUnit(Array.from(keys)[0] as string)}
            className="max-w-xs"
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
        </div>

        {/* Quick Access to Other Materials */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardBody className="text-center py-6">
              <AcademicCapIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-2">Looking for Practice Problems or Study Materials?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Access our complete collection of practice problems, video lectures, and study materials.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  color="primary" 
                  variant="flat"
                  size="sm"
                  onPress={() => router.push('/training/practice-problems')}
                >
                  Practice Problems
                </Button>
                <Button 
                  color="secondary" 
                  variant="flat"
                  size="sm"
                  onPress={() => router.push('/training/video-lectures')}
                >
                  Video Lectures
                </Button>
                <Button 
                  color="success" 
                  variant="flat"
                  size="sm"
                  onPress={() => router.push('/training/study-materials')}
                >
                  Study Materials
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Mock Test Content Grid */}
        {content.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mock tests found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later for new mock test content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <Card key={item._id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-0">
                  <div className="relative overflow-hidden rounded-lg">
                    <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                      {getContentTypeIcon(item.contentType)}
                    </div>
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                      {formatDuration(item.duration)}
                    </div>
                    <div className="absolute top-2 left-2">
                      <Chip
                        size="sm"
                        color={getContentTypeColor(item.contentType)}
                        variant="solid"
                      >
                        {item.contentType === 'pdf' ? 'PDF' : 
                         item.contentType === 'video' ? 'Video' : 
                         item.contentType === 'link' ? 'Link' : 
                         item.contentType === 'testpaperLink' ? 'Test Paper' : 'Mock Test'}
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
                    {/* Number of Problems Badge */}
                    {item.noOfProblems && (
                      <div className="absolute bottom-2 left-2">
                        <Chip
                          size="sm"
                          color="warning"
                          variant="solid"
                        >
                          {item.noOfProblems} Problems
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
                      {item.noOfProblems && (
                        <>
                          <span>•</span>
                          <span>{item.noOfProblems} problems</span>
                        </>
                      )}
                    </div>
                    <Button 
                      color="primary" 
                      size="sm"
                      variant="solid"
                      startContent={<AcademicCapIcon className="h-4 w-4" />}
                      onPress={() => handleStartTest(item)}
                    >
                      Start Test
                    </Button>
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
