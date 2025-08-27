import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button, Card, CardBody, CardHeader, Progress } from "@heroui/react"
import { 
  PlayCircleIcon, 
  BookOpenIcon, 
  ChartBarIcon, 
  UserIcon,
  AcademicCapIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default async function Dashboard() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
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
                <p className="text-sm text-gray-500">Videos Watched</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpenIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Lessons Completed</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Practice Problems</p>
                <p className="text-2xl font-bold">45</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Study Time</p>
                <p className="text-2xl font-bold">24h</p>
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
                    <h4 className="font-medium">Number Theory Basics</h4>
                    <p className="text-sm text-gray-500">Video Lecture • 45 min</p>
                  </div>
                </div>
                <Button color="primary" size="sm">
                  Continue
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BookOpenIcon className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-medium">Algebra Fundamentals</h4>
                    <p className="text-sm text-gray-500">Practice Set • 20 problems</p>
                  </div>
                </div>
                <Button color="primary" size="sm">
                  Start
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Your Progress</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Number Theory</span>
                  <span className="text-sm text-gray-500">75%</span>
                </div>
                <Progress value={75} className="w-full" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Algebra</span>
                  <span className="text-sm text-gray-500">60%</span>
                </div>
                <Progress value={60} className="w-full" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Geometry</span>
                  <span className="text-sm text-gray-500">45%</span>
                </div>
                <Progress value={45} className="w-full" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Combinatorics</span>
                  <span className="text-sm text-gray-500">30%</span>
                </div>
                <Progress value={30} className="w-full" />
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

          <Link href="/training/progress">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardBody className="text-center p-6">
                <ChartBarIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
                <p className="text-gray-600 text-sm">
                  Monitor your learning progress and achievements
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

          <Link href="/training/study-materials">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardBody className="text-center p-6">
                <BookOpenIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Study Materials</h3>
                <p className="text-gray-600 text-sm">
                  Comprehensive notes and reference materials
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
