'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardBody, CardHeader, Button, Input, Divider } from "@heroui/react"
import { UserIcon, EnvelopeIcon, AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
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
                    defaultValue={session.user?.name || ''}
                    variant="bordered"
                    startContent={<UserIcon className="h-4 w-4 text-gray-400" />}
                  />
                  <Input
                    label="Email"
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
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600">Videos Watched</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-gray-600">Lessons Completed</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">45</div>
                    <div className="text-sm text-gray-600">Problems Solved</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">24h</div>
                    <div className="text-sm text-gray-600">Study Time</div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Recent Activity</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <AcademicCapIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Completed Number Theory Basics</p>
                      <p className="text-sm text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ClockIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Started Algebra Fundamentals</p>
                      <p className="text-sm text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <AcademicCapIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Solved 5 practice problems</p>
                      <p className="text-sm text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
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
                <h3 className="text-lg font-semibold">Subscription</h3>
              </CardHeader>
              <CardBody>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">Active</div>
                  <p className="text-sm text-gray-600 mb-4">Premium Student Plan</p>
                  <Button color="primary" size="sm" className="w-full">
                    Manage Subscription
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Card>
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
