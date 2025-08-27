'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Button, Select, SelectItem, Chip, Badge } from "@heroui/react"
import { PlayCircleIcon, ClockIcon, AcademicCapIcon, BookOpenIcon, LinkIcon, DocumentIcon } from '@heroicons/react/24/outline'

interface Content {
  _id: string
  unit: string
  chapter: string
  topic: string
  concept: string
  contentType: string
  instructionType: string
  duration: number
  videoLink?: string
  description: string
  createdAt: string
}

export default function StudyMaterials() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUnit, setSelectedUnit] = useState<string>('all')
  const [selectedContentType, setSelectedContentType] = useState<string>('all')
  const [selectedInstructionType, setSelectedInstructionType] = useState<string>('all')
  
  const units = ['Algebra', 'Geometry', 'Number Theory', 'Combinatorics', 'Functional Equations', 'Inequalities', 'Advanced Math', 'Calculus', 'Other']
  const contentTypes = ['video', 'pdf', 'link', 'testpaperLink']
  const instructionTypes = ['problemDiscussion', 'conceptDiscussion']
  
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    fetchContent()
  }, [session, status, router, selectedUnit, selectedContentType, selectedInstructionType])

  const fetchContent = async () => {
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
      
      const response = await fetch(`/api/content?${params}`)
      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

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
    if (item.videoLink) {
      window.open(item.videoLink, '_blank')
    }
  }

  const getActionButtonText = (type: string) => {
    switch (type) {
      case 'video': return 'Watch'
      case 'pdf': return 'Download'
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
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Card key={item._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-0">
                  <div className="relative">
                    {item.contentType === 'video' && item.videoLink && getYouTubeVideoId(item.videoLink) ? (
                      <img
                        src={`https://img.youtube.com/vi/${getYouTubeVideoId(item.videoLink)}/maxresdefault.jpg`}
                        alt={item.concept}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://img.youtube.com/vi/${getYouTubeVideoId(item.videoLink!)}/hqdefault.jpg`
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          {getContentTypeIcon(item.contentType)}
                          <p className="mt-2 text-sm font-medium text-gray-600 capitalize">{item.contentType}</p>
                        </div>
                      </div>
                    )}
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
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge color="primary" variant="flat">{item.unit}</Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{item.concept}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.chapter} • {item.topic}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>
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
                      isDisabled={!item.videoLink}
                    >
                      {getActionButtonText(item.contentType)}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
