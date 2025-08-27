import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardBody, CardHeader, Button, Badge, Progress } from "@heroui/react"
import { BookOpenIcon, CheckCircleIcon, ClockIcon, AcademicCapIcon } from '@heroicons/react/24/outline'

export default async function PracticeProblems() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }

  const problemSets = [
    {
      id: 1,
      title: "Number Theory Fundamentals",
      description: "Practice problems covering divisibility, prime numbers, and modular arithmetic.",
      category: "Number Theory",
      difficulty: "Beginner",
      problemsCount: 20,
      completedProblems: 15,
      estimatedTime: "45 min",
      isCompleted: false
    },
    {
      id: 2,
      title: "Algebra Basics",
      description: "Problems on polynomials, equations, and inequalities.",
      category: "Algebra",
      difficulty: "Beginner",
      problemsCount: 25,
      completedProblems: 0,
      estimatedTime: "60 min",
      isCompleted: false
    },
    {
      id: 3,
      title: "Geometry Essentials",
      description: "Geometric problems involving triangles, circles, and polygons.",
      category: "Geometry",
      difficulty: "Intermediate",
      problemsCount: 18,
      completedProblems: 0,
      estimatedTime: "50 min",
      isCompleted: false
    },
    {
      id: 4,
      title: "Combinatorics Practice",
      description: "Counting problems and probability concepts.",
      category: "Combinatorics",
      difficulty: "Intermediate",
      problemsCount: 15,
      completedProblems: 0,
      estimatedTime: "40 min",
      isCompleted: false
    },
    {
      id: 5,
      title: "Advanced Problem Solving",
      description: "Complex problems requiring multiple techniques and strategies.",
      category: "Problem Solving",
      difficulty: "Advanced",
      problemsCount: 12,
      completedProblems: 0,
      estimatedTime: "75 min",
      isCompleted: false
    },
    {
      id: 6,
      title: "Mathematical Induction",
      description: "Problems requiring proof by mathematical induction.",
      category: "Proof Techniques",
      difficulty: "Intermediate",
      problemsCount: 10,
      completedProblems: 0,
      estimatedTime: "35 min",
      isCompleted: false
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'success'
      case 'Intermediate':
        return 'warning'
      case 'Advanced':
        return 'danger'
      default:
        return 'default'
    }
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
              <div className="text-2xl font-bold text-blue-600">15</div>
              <div className="text-sm text-gray-500">Problems Completed</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-gray-500">Sets Started</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-purple-600">75%</div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-orange-600">12h</div>
              <div className="text-sm text-gray-500">Total Time</div>
            </CardBody>
          </Card>
        </div>

        {/* Filters */}
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

        {/* Problem Sets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problemSets.map((set) => (
            <Card key={set.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between mb-2">
                  <Badge color={getDifficultyColor(set.difficulty)} variant="flat">
                    {set.difficulty}
                  </Badge>
                  {set.isCompleted && (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <AcademicCapIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{set.category}</span>
                </div>
              </CardHeader>
              <CardBody>
                <h3 className="text-lg font-semibold mb-2">{set.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{set.description}</p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{set.completedProblems}/{set.problemsCount}</span>
                  </div>
                  <Progress 
                    value={(set.completedProblems / set.problemsCount) * 100} 
                    className="w-full"
                    color="primary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4" />
                    <span>{set.estimatedTime}</span>
                  </div>
                  <Button 
                    color="primary" 
                    size="sm"
                    startContent={<BookOpenIcon className="h-4 w-4" />}
                  >
                    {set.completedProblems > 0 ? 'Continue' : 'Start'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button variant="light" color="primary">
            Load More Problem Sets
          </Button>
        </div>
      </div>
    </div>
  )
}
