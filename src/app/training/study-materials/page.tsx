'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardBody, CardHeader, Button, Select, SelectItem, Chip, Badge } from "@heroui/react"
import { PlayCircleIcon, ClockIcon, AcademicCapIcon, BookOpenIcon, LinkIcon, DocumentIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
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
  createdBy?: string
  isActive: boolean
}

interface ContentWithAttempt extends Content {
  attemptStatus?: 'not_attempted' | 'attempted'
}

export default function StudyMaterials() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [content, setContent] = useState<ContentWithAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUnit, setSelectedUnit] = useState<string>('all')
  const [selectedContentType, setSelectedContentType] = useState<string>('all')
  const [selectedInstructionType, setSelectedInstructionType] = useState<string>('all')
  const [selectedDocCategory, setSelectedDocCategory] = useState<string>('all')
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [showContentViewer, setShowContentViewer] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  
  const fetchContent = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedUnit !== 'all') {
        params.append('unit', selectedUnit)
      }
      
      if (selectedContentType !== 'all') {
        params.append('contentType', selectedContentType)
      }
      
      if (selectedInstructionType !== 'all') {
        params.append('instructionType', selectedInstructionType)
      }
      
      if (selectedDocCategory !== 'all') {
        params.append('docCategory', selectedDocCategory)
      }
      
      // Ensure content is sorted by sequence (this is the default in the API)
      params.append('sortBy', 'sequence')
      
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
  }, [selectedUnit, selectedContentType, selectedInstructionType, selectedDocCategory])
  
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

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircleIcon className="h-5 w-5" />
      case 'pdf': return <DocumentIcon className="h-5 w-5" />
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

  const getActionButtonText = (type: string) => {
    switch (type) {
      case 'video': return 'Watch'
      case 'pdf': return 'View'
      case 'link': return 'Open'
      case 'testpaperLink': return 'View Test'
      default: return 'View'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading study materials...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Study Materials</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive collection of videos, PDFs, links, and test papers covering all Olympiad topics
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            label="Content Type"
            placeholder="All Types"
            selectedKeys={[selectedContentType]}
            onSelectionChange={(keys) => setSelectedContentType(Array.from(keys)[0] as string)}
          >
            <SelectItem key="all">All Types</SelectItem>
            <SelectItem key="video">Videos</SelectItem>
            <SelectItem key="pdf">PDFs</SelectItem>
            <SelectItem key="link">Links</SelectItem>
            <SelectItem key="testpaperLink">Test Papers</SelectItem>
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
          
          <Select
            label="Document Category"
            placeholder="All Categories"
            selectedKeys={[selectedDocCategory]}
            onSelectionChange={(keys) => setSelectedDocCategory(Array.from(keys)[0] as string)}
          >
            <SelectItem key="all">All Categories</SelectItem>
            <SelectItem key="Learning">Learning</SelectItem>
            <SelectItem key="MockTest">Mock Test</SelectItem>
            <SelectItem key="PracticeSet">Practice Set</SelectItem>
          </Select>
        </div>

        {/* Content Grid */}
        {content.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later for new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <Card key={item._id} className="hover:shadow-lg transition-shadow ">
                {/* VIDEO CONTENT LAYOUT */}
                {item.contentType === 'video' && item.videoLink && getYouTubeVideoId(item.videoLink) ? (
                  <CardHeader className="pb-0">
                    <div className="relative">
                      <Image
                        src={imageErrors[item._id] 
                          ? `https://img.youtube.com/vi/${getYouTubeVideoId(item.videoLink)}/hqdefault.jpg`
                          : `https://img.youtube.com/vi/${getYouTubeVideoId(item.videoLink)}/maxresdefault.jpg`
                        }
                        alt={item.concept}
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover rounded-lg"
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
                            Attempted
                          </Chip>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                ) : (
                  /* PDF CONTENT LAYOUT */
                  <CardHeader className="pb-4 bg-slate-200">
                    {/* Clean header section for PDFs */}
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
                      <div className="flex items-center gap-2">
                        {item.attemptStatus === 'attempted' ? (
                          <Chip
                            size="sm"
                            color="success"
                            variant="solid"
                            startContent={<CheckCircleIcon className="h-3 w-3" />}
                          >
                            Attempted
                          </Chip>
                        ) : (
                          <Chip
                            size="sm"
                            color="danger"
                            variant="solid"
                            startContent={<XCircleIcon className="h-3 w-3" />}
                          >
                            Not Attempted
                          </Chip>
                        )}
                        {/* <div className="bg-gray-900 text-white px-2 py-1 rounded text-sm">
                          {formatDuration(item.duration)}
                        </div> */}
                      </div>
                    </div>
                    
                  </CardHeader>
                )}
                <CardBody className="bg-slate-100">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Chip color="primary" variant="flat" size="sm">{item.unit}</Chip>
                    <Chip color="secondary" variant="flat" size="sm">{item.docCategory} #{item.sequenceNo}</Chip>
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
                    <Button 
                      color={getContentTypeColor(item.contentType) as "primary" | "success" | "warning" | "danger" | "secondary" | "default"} 
                      size="sm"
                      startContent={getContentTypeIcon(item.contentType)}
                      onPress={() => handleContentAction(item)}
                    >
                      {getActionButtonText(item.contentType)}
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
