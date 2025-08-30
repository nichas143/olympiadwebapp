'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardBody, CardHeader, Button, Badge, Select, SelectItem, Chip } from "@heroui/react"
import { BookOpenIcon, CheckCircleIcon, ClockIcon, AcademicCapIcon, PlayCircleIcon } from '@heroicons/react/24/outline'
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

export default function PracticeProblems() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [practiceSets, setPracticeSets] = useState<ContentWithAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUnit, setSelectedUnit] = useState<string>('all')
  const [stats, setStats] = useState({
    totalAttempted: 0,
    totalContent: 0,
    attemptRate: 0
  })
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [showContentViewer, setShowContentViewer] = useState(false)
  
  const fetchPracticeSets = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch practice sets (Content with docCategory = 'PracticeSet')
      const contentParams = new URLSearchParams()
      contentParams.append('docCategory', 'PracticeSet')
      contentParams.append('sortBy', 'sequence') // This ensures sequenceNo priority
      if (selectedUnit !== 'all') {
        contentParams.append('unit', selectedUnit)
      }
      
      const contentResponse = await fetch(`/api/content?${contentParams}`)
      
      if (contentResponse.ok) {
        const contentData = await contentResponse.json()
        
        // Fetch attempt status for each practice set
        const practiceSetWithAttempts = await Promise.all(
          contentData.content.map(async (content: Content) => {
            try {
              const progressResponse = await fetch(`/api/progress?contentId=${content._id}`)
              if (progressResponse.ok) {
                const progressData = await progressResponse.json()
                return {
                  ...content,
                  attemptStatus: progressData.progress?.status || 'not_attempted'
                }
              }
            } catch (error) {
              console.error('Failed to fetch attempt status:', error)
            }
            return {
              ...content,
              attemptStatus: 'not_attempted'
            }
          })
        )
        
        setPracticeSets(practiceSetWithAttempts)
        
        // Calculate stats
        calculateStats(practiceSetWithAttempts)
      }
    } catch (error) {
      console.error('Failed to fetch practice sets:', error)
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
    
    fetchPracticeSets()
  }, [session, status, router, fetchPracticeSets])

  const calculateStats = (sets: ContentWithAttempt[]) => {
    const attempted = sets.filter(set => set.attemptStatus === 'attempted').length
    const total = sets.length
    const attemptRate = total > 0 ? Math.round((attempted / total) * 100) : 0
    
    setStats({
      totalAttempted: attempted,
      totalContent: total,
      attemptRate: attemptRate
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const handleStartPractice = (practiceSet: ContentWithAttempt) => {
    setSelectedContent(practiceSet)
    setShowContentViewer(true)
  }

  const handleAttemptUpdate = async (contentId: string, attempted: boolean) => {
    // Update the local state to reflect the attempt status
    setPracticeSets(prevSets => 
      prevSets.map(set => 
        set._id === contentId 
          ? { ...set, attemptStatus: attempted ? 'attempted' : 'not_attempted' }
          : set
      )
    )
    
    // Recalculate stats
    const updatedSets: ContentWithAttempt[] = practiceSets.map(set => 
      set._id === contentId 
        ? { ...set, attemptStatus: attempted ? 'attempted' : 'not_attempted' }
        : set
    )
    calculateStats(updatedSets)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading practice problems...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Practice Problems</h1>
          <p className="mt-2 text-gray-600">
            Curated problem sets with detailed solutions to enhance your skills
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalAttempted}</div>
              <div className="text-sm text-gray-500">Sets Attempted</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalContent}</div>
              <div className="text-sm text-gray-500">Total Sets</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.attemptRate}%</div>
              <div className="text-sm text-gray-500">Attempt Rate</div>
            </CardBody>
          </Card>
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

        {/* Problem Sets Grid */}
        {practiceSets.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No practice sets found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later for new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practiceSets.map((set) => (
              <Card key={set._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge color="primary" variant="flat">{set.unit}</Badge>
                      <Badge color="default" variant="flat" size="sm">#{set.sequenceNo}</Badge>
                    </div>
                    {set.attemptStatus === 'attempted' && (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Chip
                      size="sm"
                      color={set.attemptStatus === 'attempted' ? "success" : "default"}
                      variant="flat"
                      startContent={set.attemptStatus === 'attempted' ? <CheckCircleIcon className="h-3 w-3" /> : undefined}
                    >
                      {set.attemptStatus === 'attempted' ? 'Attempted' : 'Not Attempted'}
                    </Chip>
                    {set.noOfProblems && (
                      <Badge color="secondary" variant="flat" size="sm">
                        {set.noOfProblems} problems
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardBody>
                  <h3 className="text-lg font-semibold mb-1">{set.concept}</h3>
                  <p className="text-sm text-gray-500 mb-2">{set.chapter} • {set.topic}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{set.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4" />
                      <span>{formatDuration(set.duration)}</span>
                    </div>
                    <Button 
                      color="primary" 
                      size="sm"
                      startContent={set.contentType === 'video' ? <PlayCircleIcon className="h-4 w-4" /> : <BookOpenIcon className="h-4 w-4" />}
                      onPress={() => handleStartPractice(set)}
                    >
                      {set.attemptStatus === 'attempted' ? 'Review' : 'Start'}
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
