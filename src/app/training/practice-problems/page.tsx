'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardBody, CardHeader, Button, Badge, Progress, Select, SelectItem } from "@heroui/react"
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

interface UserProgress {
  _id: string
  userId: string
  contentId: string
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  progressPercentage: number
  timeSpent: number
  lastAccessedAt: string
  completedAt?: string
  testScore?: number
  testAttempts?: number
  correctAnswers?: number
  totalQuestions?: number
}

interface PracticeSetWithProgress extends Content {
  progress?: UserProgress
}

export default function PracticeProblems() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [practiceSets, setPracticeSets] = useState<PracticeSetWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUnit, setSelectedUnit] = useState<string>('all')
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalStarted: 0,
    totalTimeSpent: 0,
    averageScore: 0
  })
    const [selectedContent, setSelectedContent] = useState<PracticeSetWithProgress | null>(null)
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
      
      const [contentResponse, progressResponse] = await Promise.all([
        fetch(`/api/content?${contentParams}`),
        fetch('/api/progress')
      ])
      
      if (contentResponse.ok && progressResponse.ok) {
        const contentData = await contentResponse.json()
        const progressData = await progressResponse.json()
        
        // Create a map of progress by contentId for quick lookup
        const progressMap = new Map<string, UserProgress>()
        progressData.progress?.forEach((p: UserProgress) => {
          progressMap.set(p.contentId, p)
        })
        
        // Merge content with progress data
        const practiceSetWithProgress: PracticeSetWithProgress[] = contentData.content.map((content: Content) => ({
          ...content,
          progress: progressMap.get(content._id)
        }))
        
        setPracticeSets(practiceSetWithProgress)
        
        // Calculate stats
        calculateStats(practiceSetWithProgress)
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

  const calculateStats = (sets: PracticeSetWithProgress[]) => {
    const completed = sets.filter(set => set.progress?.status === 'completed').length
    const started = sets.filter(set => set.progress?.status === 'in_progress' || set.progress?.status === 'completed').length
    const totalTime = sets.reduce((sum, set) => sum + (set.progress?.timeSpent || 0), 0)
    const scoresArray = sets.map(set => set.progress?.testScore).filter(score => score !== undefined && score !== null) as number[]
    const avgScore = scoresArray.length > 0 ? scoresArray.reduce((sum, score) => sum + score, 0) / scoresArray.length : 0
    
    setStats({
      totalCompleted: completed,
      totalStarted: started,
      totalTimeSpent: Math.round(totalTime),
      averageScore: Math.round(avgScore)
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'primary'
      case 'skipped': return 'warning'
      default: return 'default'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'completed': return 'Completed'
      case 'in_progress': return 'In Progress'
      case 'skipped': return 'Skipped'
      default: return 'Not Started'
    }
  }

  const handleStartPractice = (practiceSet: PracticeSetWithProgress) => {
    setSelectedContent(practiceSet)
    setShowContentViewer(true)
  }

  const handleProgressUpdate = async (contentId: string, progressPercentage: number, timeSpent: number) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          progressPercentage,
          timeSpent,
          status: progressPercentage >= 100 ? 'completed' : 'in_progress'
        }),
      })

      if (response.ok) {
        // Refresh the practice sets to show updated progress
        fetchPracticeSets()
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalCompleted}</div>
              <div className="text-sm text-gray-500">Sets Completed</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalStarted}</div>
              <div className="text-sm text-gray-500">Sets Started</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.averageScore}%</div>
              <div className="text-sm text-gray-500">Average Score</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatDuration(stats.totalTimeSpent)}</div>
              <div className="text-sm text-gray-500">Total Time Spent</div>
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
                    {set.progress?.status === 'completed' && (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge color={getStatusColor(set.progress?.status)} variant="flat" size="sm">
                      {getStatusText(set.progress?.status)}
                    </Badge>
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
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{set.progress?.progressPercentage || 0}%</span>
                    </div>
                    <Progress 
                      value={set.progress?.progressPercentage || 0} 
                      className="w-full"
                      color={getStatusColor(set.progress?.status) as "primary" | "success" | "warning" | "danger" | "secondary" | "default"}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    {set.progress?.timeSpent && set.progress.timeSpent > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Time Spent:</span>
                        <span className="font-medium">{formatDuration(set.progress.timeSpent)}</span>
                      </div>
                    )}
                    {set.progress?.testScore !== undefined && set.progress.testScore !== null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Best Score:</span>
                        <span className="font-medium text-green-600">{set.progress.testScore}%</span>
                      </div>
                    )}
                    {set.progress?.testAttempts && set.progress.testAttempts > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Attempts:</span>
                        <span className="font-medium">{set.progress.testAttempts}</span>
                      </div>
                    )}
                  </div>

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
                      {set.progress?.status === 'completed' ? 'Review' : 
                       set.progress?.status === 'in_progress' ? 'Continue' : 'Start'}
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
            onProgressUpdate={handleProgressUpdate}
          />
        )}
      </div>
    </div>
  )
}
