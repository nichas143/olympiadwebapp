'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Button, Input, Divider, Chip } from "@heroui/react"
import { UserIcon, EnvelopeIcon, AcademicCapIcon, ClockIcon, PlayCircleIcon, BookOpenIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface ProgressSummary {
  summary: Array<{
    _id: string
    count: number
  }>
  totalContent: number
  attemptedContent: number
  attemptRate: number
}

interface UserProgress {
  _id: string
  contentId: string
  status: 'not_attempted' | 'attempted'
  lastAccessedAt: string
  attemptedAt?: string
  notes?: string
  isBookmarked: boolean
  content?: {
    concept: string
    unit: string
    contentType: string
  }
}

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [progressData, setProgressData] = useState<ProgressSummary | null>(null)
  const [recentActivity, setRecentActivity] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Fetch profile data
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        
        // Fetch progress summary
        const progressResponse = await fetch('/api/progress?summary=true')
        if (progressResponse.ok) {
          const progressData = await progressResponse.json()
          setProgressData(progressData)
        }

        // Fetch recent activity (last 10 accessed items)
        const activityResponse = await fetch('/api/progress')
        if (activityResponse.ok) {
          const activityData = await activityResponse.json()
          // Get the most recent 10 items
          const recent = activityData.progress?.slice(0, 10) || []
          setRecentActivity(recent)
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [session, status, router])

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return '1 day ago'
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  const getActivityIcon = (contentType: string) => {
    switch (contentType) {
      case 'video': return <PlayCircleIcon className="h-4 w-4" />
      case 'pdf': return <BookOpenIcon className="h-4 w-4" />
      default: return <AcademicCapIcon className="h-4 w-4" />
    }
  }

  const getActivityColor = (contentType: string) => {
    switch (contentType) {
      case 'video': return 'blue'
      case 'pdf': return 'green'
      default: return 'purple'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Personal Information</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <UserIcon className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{session.user?.name}</h3>
                    <p className="text-gray-500">{session.user?.email}</p>
                    <p className="text-sm text-gray-400">Member since {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                
                <Divider />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    // disabled={true}
                    defaultValue={session.user?.name || ''}
                    variant="bordered"
                    startContent={<UserIcon className="h-4 w-4 text-gray-400" />}
                  />
                  <Input
                    label="Email"
                    // disabled={true}
                    defaultValue={session.user?.email || ''}
                    variant="bordered"
                    startContent={<EnvelopeIcon className="h-4 w-4 text-gray-400" />}
                    isReadOnly
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button color="primary">
                    Update Profile
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Learning Statistics</h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{getAttemptedCount()}</div>
                    <div className="text-sm text-gray-600">Content Attempted</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{progressData?.totalContent || 0}</div>
                    <div className="text-sm text-gray-600">Total Content</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{progressData?.attemptRate || 0}%</div>
                    <div className="text-sm text-gray-600">Attempt Rate</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{getNotAttemptedCount()}</div>
                    <div className="text-sm text-gray-600">Remaining</div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Recent Activity</h2>
              </CardHeader>
              <CardBody>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400">Start learning to see your activity here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity._id} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-${getActivityColor(activity.content?.contentType || 'default')}-100 rounded-full flex items-center justify-center`}>
                          {getActivityIcon(activity.content?.contentType || 'default')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{activity.content?.concept || 'Unknown Content'}</p>
                            <Chip
                              size="sm"
                              color={activity.status === 'attempted' ? "success" : "default"}
                              variant="flat"
                            >
                              {activity.status === 'attempted' ? 'Attempted' : 'Not Attempted'}
                            </Chip>
                          </div>
                          <p className="text-sm text-gray-500">
                            {activity.content?.unit} • {formatDate(activity.lastAccessedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Account Settings</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <Button variant="light" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="light" className="w-full justify-start">
                  Notification Preferences
                </Button>
                <Button variant="light" className="w-full justify-start">
                  Privacy Settings
                </Button>
                <Button variant="light" className="w-full justify-start">
                  Download Data
                </Button>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Learning Progress</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overall Progress</span>
                    <span className="text-sm font-medium">{progressData?.attemptRate || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressData?.attemptRate || 0}%` }}
                    ></div>
                  </div>
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-600">
                      {getAttemptedCount()} of {progressData?.totalContent || 0} content items attempted
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card isDisabled={true}>
              <CardHeader>
                <h3 className="text-lg font-semibold">Support</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <Button variant="light" className="w-full justify-start">
                  Help Center
                </Button>
                <Button variant="light" className="w-full justify-start">
                  Contact Support
                </Button>
                <Button variant="light" className="w-full justify-start">
                  Feedback
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
