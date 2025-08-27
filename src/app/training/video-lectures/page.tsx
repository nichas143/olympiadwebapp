import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardBody, CardHeader, Button } from "@heroui/react"
import { PlayCircleIcon, ClockIcon, AcademicCapIcon } from '@heroicons/react/24/outline'

export default async function VideoLectures() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }

  const lectures = [
    {
      id: 1,
      title: "Number Theory Basics",
      description: "Introduction to fundamental concepts in number theory including divisibility, prime numbers, and modular arithmetic.",
      duration: "45 min",
      category: "Number Theory",
      thumbnail: "/api/placeholder/400/225",
      progress: 75
    },
    {
      id: 2,
      title: "Algebra Fundamentals",
      description: "Core algebraic concepts including polynomials, equations, and inequalities essential for Olympiad problems.",
      duration: "60 min",
      category: "Algebra",
      thumbnail: "/api/placeholder/400/225",
      progress: 0
    },
    {
      id: 3,
      title: "Geometry Essentials",
      description: "Geometric principles, theorems, and problem-solving techniques for Olympiad geometry.",
      duration: "50 min",
      category: "Geometry",
      thumbnail: "/api/placeholder/400/225",
      progress: 0
    },
    {
      id: 4,
      title: "Combinatorics Introduction",
      description: "Basic combinatorial principles, counting techniques, and probability concepts.",
      duration: "40 min",
      category: "Combinatorics",
      thumbnail: "/api/placeholder/400/225",
      progress: 0
    },
    {
      id: 5,
      title: "Problem Solving Strategies",
      description: "Advanced problem-solving techniques and strategies for tackling complex Olympiad problems.",
      duration: "55 min",
      category: "Problem Solving",
      thumbnail: "/api/placeholder/400/225",
      progress: 0
    },
    {
      id: 6,
      title: "Mathematical Induction",
      description: "Understanding and applying mathematical induction in various mathematical contexts.",
      duration: "35 min",
      category: "Proof Techniques",
      thumbnail: "/api/placeholder/400/225",
      progress: 0
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Video Lectures</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive video tutorials covering all Olympiad topics
          </p>
        </div>

        {/* Categories Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button color="primary" variant="solid" size="sm">All</Button>
            <Button variant="light" size="sm">Number Theory</Button>
            <Button variant="light" size="sm">Algebra</Button>
            <Button variant="light" size="sm">Geometry</Button>
            <Button variant="light" size="sm">Combinatorics</Button>
            <Button variant="light" size="sm">Problem Solving</Button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lectures.map((lecture) => (
            <Card key={lecture.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-0">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <PlayCircleIcon className="h-16 w-16 text-blue-600" />
                  </div>
                  <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    {lecture.duration}
                  </div>
                  {lecture.progress > 0 && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="bg-white bg-opacity-90 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${lecture.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex items-center gap-2 mb-2">
                  <AcademicCapIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{lecture.category}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{lecture.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{lecture.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4" />
                    <span>{lecture.duration}</span>
                  </div>
                  <Button 
                    color="primary" 
                    size="sm"
                    startContent={lecture.progress > 0 ? undefined : <PlayCircleIcon className="h-4 w-4" />}
                  >
                    {lecture.progress > 0 ? 'Continue' : 'Start'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button variant="light" color="primary">
            Load More Lectures
          </Button>
        </div>
      </div>
    </div>
  )
}
