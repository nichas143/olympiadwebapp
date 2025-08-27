'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from "next/link"
import { Button, Card, CardBody, CardHeader, Chip } from "@heroui/react"
import { 
  PlayCircleIcon, 
  BookOpenIcon, 
  ChartBarIcon, 
  UserIcon,
  AcademicCapIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface ProgressSummary {
  summary: Array<{
    _id: string
    count: number
  }>
  totalContent: number
  attemptedContent: number
  attemptRate: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [progressData, setProgressData] = useState<ProgressSummary | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Fetch progress summary
    const fetchProgressSummary = async () => {
      try {
        const response = await fetch('/api/progress?summary=true')
        if (response.ok) {
          const data = await response.json()
          setProgressData(data)
        }
      } catch (error) {
        console.error('Failed to fetch progress summary:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgressSummary()
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getAttemptedCount = () => {
    if (!progressData?.summary) return 0
    const attempted = progressData.summary.find(item => item._id === 'attempted')
    return attempted?.count || 0
  }

  const getNotAttemptedCount = () => {
    if (!progressData?.summary) return 0
    const notAttempted = progressData.summary.find(item => item._id === 'not_attempted')
    return notAttempted?.count || 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Continue your Olympiad preparation journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardBody className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PlayCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Content Attempted</p>
                <p className="text-2xl font-bold">{getAttemptedCount()}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpenIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Content</p>
                <p className="text-2xl font-bold">{progressData?.totalContent || 0}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Attempt Rate</p>
                <p className="text-2xl font-bold">{progressData?.attemptRate || 0}%</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Remaining</p>
                <p className="text-2xl font-bold">{getNotAttemptedCount()}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Continue Learning</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <PlayCircleIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Video Lectures</h4>
                    <p className="text-sm text-gray-500">Watch comprehensive video tutorials</p>
                  </div>
                </div>
                <Button color="primary" size="sm" onPress={() => router.push('/training/video-lectures')}>
                  Browse
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BookOpenIcon className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-medium">Study Materials</h4>
                    <p className="text-sm text-gray-500">Access PDFs and practice materials</p>
                  </div>
                </div>
                <Button color="primary" size="sm" onPress={() => router.push('/training/study-materials')}>
                  Browse
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Your Progress</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Content Attempted</span>
                <Chip color="success" variant="flat" size="sm">
                  {getAttemptedCount()} / {progressData?.totalContent || 0}
                </Chip>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Attempt Rate</span>
                <span className="text-sm text-gray-500">{progressData?.attemptRate || 0}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Remaining Content</span>
                <Chip color="default" variant="flat" size="sm">
                  {getNotAttemptedCount()} items
                </Chip>
              </div>
              
              <div className="pt-2">
                <Button 
                  color="primary" 
                  variant="flat" 
                  size="sm" 
                  className="w-full"
                  onPress={() => router.push('/training/video-lectures')}
                >
                  Continue Learning
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Training Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/training/video-lectures">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardBody className="text-center p-6">
                <PlayCircleIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Video Lectures</h3>
                <p className="text-gray-600 text-sm">
                  Comprehensive video tutorials covering all Olympiad topics
                </p>
              </CardBody>
            </Card>
          </Link>

          <Link href="/training/practice-problems">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardBody className="text-center p-6">
                <BookOpenIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Practice Problems</h3>
                <p className="text-gray-600 text-sm">
                  Curated problem sets with detailed solutions
                </p>
              </CardBody>
            </Card>
          </Link>

          <Link href="/training/study-materials">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardBody className="text-center p-6">
                <ChartBarIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Study Materials</h3>
                <p className="text-gray-600 text-sm">
                  PDFs, links, and reference materials for comprehensive learning
                </p>
              </CardBody>
            </Card>
          </Link>

          <Link href="/training/mock-tests">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardBody className="text-center p-6">
                <AcademicCapIcon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Mock Tests</h3>
                <p className="text-gray-600 text-sm">
                  Simulate real Olympiad exam conditions
                </p>
              </CardBody>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardBody className="text-center p-6">
                <UserIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Profile</h3>
                <p className="text-gray-600 text-sm">
                  Manage your account and preferences
                </p>
              </CardBody>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
