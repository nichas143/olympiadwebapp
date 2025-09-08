'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Badge, Chip } from "@heroui/react"
import { PlayCircleIcon, ClockIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import PublicVideoPlayer from '@/app/components/PublicVideoPlayer'
import { usePublicContent } from '@/hooks/usePublicContent'

interface Content {
  _id: string
  unit: 'Algebra' | 'Geometry' | 'Number Theory' | 'Combinatorics' | 'Functional Equations' | 'Inequalities' | 'Advanced Math' | 'Calculus' | 'Other'
  chapter: string
  topic: string
  concept: string
  contentType: 'pdf' | 'video' | 'link' | 'testpaperLink'
  instructionType: 'problemDiscussion' | 'conceptDiscussion'
  level: string
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

export default function Prerequisites() {
  const [selectedVideo, setSelectedVideo] = useState<Content | null>(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)

  // Fetch prerequisite videos (public access)
  const { content: prerequisiteVideos, loading: videosLoading, error: videosError } = usePublicContent({
    level: 'Pre-requisite',
    contentType: 'video',
    sortBy: 'sequence',
    limit: 50
  })

  // No authentication required for prerequisites page
  // useEffect(() => {
  //   if (status === 'loading') return
  //   
  //   if (!session) {
  //     router.push('/auth/signin')
  //     return
  //   }
  // }, [session, status, router])

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

  const handleVideoAction = (item: Content) => {
    setSelectedVideo(item)
    setShowVideoPlayer(true)
  }

  // No progress tracking for public videos
  // const handleAttemptUpdate = async (contentId: string, attempted: boolean) => {
  //   // Progress tracking not available for public access
  // }
  const prerequisites = [
    {
      category: 'Algebra',
      skills: [
        'Basic fraction addition, multiplication, division',
        'BODMAS rule',
        'Solving linear equation in one variable',
        'Solving simultaneous linear equation in two variables',
        'Working and finding roots of 2-3 digits numbers',
        'Knowing what are square of numbers',
        'Know what are polynomials in 1-2 variables, Monomials, working with product, addition, subtraction of polynomials',
        'Division of polynomials (long division) with linear divisor'
      ],
      level: 'Compulsory',
      description: 'Core algebraic concepts and techniques essential for olympiad problem solving'
    },
    {
      category: 'Geometry',
      skills: [
        'Corresponding, alternate, interior, vertically opposite angles in parallel lines with transversal',
        'Types of triangles (acute, obtuse, right angled) (isosceles, equilateral, scalene)',
        'Circle, tangent, secant',
        'Arc of circle',
        'Pythagoras theorem',
        'Linear pair formation',
        'Sum of angles in a triangle, polygon'
      ],
      level: 'Compulsory',
      description: 'Fundamental geometric concepts and properties needed for olympiad geometry problems'
    },
    {
      category: 'Number Theory',
      skills: [
        'Finding GCD and LCM of numbers',
        'Know what are prime numbers, composites',
        'Division algorithm'
      ],
      level: 'Compulsory',
      description: 'Basic number theory concepts that form the foundation for advanced olympiad problems'
    },
    {
      category: 'Combinatorics',
      skills: [
        'Addition, multiplication principle',
        'Permutations',
        'Combination'
      ],
      level: 'Optional',
      description: 'Counting principles and combinatorial techniques for olympiad problems'
    },
    {
      category: 'Functional',
      skills: [
        'Concept of functions'
      ],
      level: 'Optional',
      description: 'Understanding of function concepts and their applications'
    },
    {
      category: 'Basic Inequalities',
      skills: [
        'Basic rules of inequalities',
        'Addition, multiplication in inequalities',
        'Inequalities in one, two variable',
        'SOS method'
      ],
      level: 'Optional',
      description: 'Inequality techniques and methods commonly used in olympiad problems'
    }
  ];

  const studyTips = [
    {
      title: 'Master the Fundamentals',
      description: 'Ensure you have a solid understanding of all prerequisite topics before starting olympiad preparation.',
      icon: '🏗️'
    },
    {
      title: 'Practice Problem Solving',
      description: 'Solve problems from each topic area to develop strong problem-solving skills.',
      icon: '📝'
    },
    {
      title: 'Understand Concepts Deeply',
      description: 'Focus on understanding the underlying principles rather than memorizing formulas.',
      icon: '🧠'
    },
    {
      title: 'Work on Proofs',
      description: 'Practice writing mathematical proofs to develop logical thinking and rigor.',
      icon: '✍️'
    },
    {
      title: 'Use Multiple Resources',
      description: 'Refer to different textbooks and online resources for comprehensive learning.',
      icon: '📚'
    },
    {
      title: 'Join Study Groups',
      description: 'Collaborate with peers to discuss problems and learn different approaches.',
      icon: '👥'
    }
  ];

  const assessmentAreas = [
    {
      title: 'Algebra Assessment',
      topics: ['Fractions & BODMAS', 'Linear Equations', 'Polynomials', 'Square Roots','Indices','Algebraic Identities'],
      color: 'primary'
    },
    {
      title: 'Geometry Assessment', 
      topics: ['Angles & Triangles', 'Circles & Tangents', 'Pythagoras Theorem', 'Polygons','Congruence in triangles','Similarity in triangles','Inscribed angles','Cyclic quadrilaterals'],
      color: 'success'
    },
    {
      title: 'Number Theory Assessment',
      topics: ['GCD & LCM', 'Prime Numbers', 'Division Algorithm'],
      color: 'secondary'
    },
    {
      title: 'Combinatorics Assessment',
      topics: ['Counting Principles'],
      color: 'warning'
    },
    {
      title: 'Functions Assessment',
      topics: ['Function Concepts', 'Function Properties'],
      color: 'danger'
    },
    {
      title: 'Inequalities Assessment',
      topics: ['Basic Rules', 'Operations', 'SOS Method'],
      color: 'default'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-success-600 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Prerequisites for Mathematical Olympiads
            </h1>
            <p className="text-xl md:text-2xl text-success-100 max-w-3xl mx-auto">
              Master these fundamental mathematical concepts before starting your olympiad preparation journey
            </p>
          </div>
        </div>
      </section>

      {/* Prerequisites Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Required Mathematical Background
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These are the specific skills and knowledge areas you should master before enrolling in our olympiad preparation program
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {prerequisites.map((prereq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{prereq.category}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    prereq.level === 'Compulsory' 
                      ? 'bg-success-100 text-success-800' 
                      : prereq.level === 'Optional'
                      ? 'bg-warning-100 text-warning-800'
                      : 'bg-primary-100 text-primary-800'
                  }`}>
                    {prereq.level}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 text-sm">{prereq.description}</p>
                <ul className="space-y-2">
                  {prereq.skills.map((skill, skillIndex) => (
                    <li key={skillIndex} className="flex items-center">
                      <span className="text-green-400 mr-2">•</span>
                      <span className="text-gray-700 text-sm">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pre-requisites Lectures */}
      <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Pre-requisites Lectures
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Watch these video lectures to strengthen your understanding of prerequisite concepts before starting the olympiad program
              </p>
            </div>

            {videosLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading prerequisite lectures...</p>
                </div>
              </div>
            ) : videosError ? (
              <div className="text-center py-12">
                <p className="text-red-600">Error loading prerequisite lectures. Please try again later.</p>
              </div>
            ) : prerequisiteVideos && prerequisiteVideos.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prerequisiteVideos.map((video) => {
                  const videoId = getYouTubeVideoId(video.videoLink || '')
                  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''
                  
                  return (
                    <Card key={video._id} className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="p-0">
                        <div className="relative w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                          {thumbnailUrl ? (
                            <img
                              src={thumbnailUrl}
                              alt={video.concept}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <PlayCircleIcon className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                            <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                              <PlayCircleIcon className="h-16 w-16 text-white" />
                            </div>
                          </div>
                          <div className="absolute top-2 right-2">
                            <Chip size="sm" color="primary" variant="solid">
                              {formatDuration(video.duration)}
                            </Chip>
                          </div>
                        </div>
                      </CardHeader>
                      <CardBody className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge color="primary" variant="flat" size="sm">
                            {video.unit}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {formatDuration(video.duration)}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {video.concept}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {video.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {video.chapter} • {video.topic}
                          </div>
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => handleVideoAction(video)}
                            startContent={<PlayCircleIcon className="h-4 w-4" />}
                          >
                            Watch
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Prerequisite Lectures Available</h3>
                <p className="text-gray-600">Check back later for prerequisite video lectures.</p>
              </div>
            )}
          </div>
        </section>

      {/* Assessment Areas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Assessment Areas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our diagnostic assessment will evaluate your proficiency in these specific areas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessmentAreas.map((area, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  area.color === 'primary' ? 'bg-primary-100' :
                  area.color === 'success' ? 'bg-success-100' :
                  area.color === 'secondary' ? 'bg-secondary-100' :
                  area.color === 'warning' ? 'bg-warning-100' :
                  area.color === 'danger' ? 'bg-danger-100' :
                  'bg-default-100'
                }`}>
                  <span className={`font-bold text-lg ${
                    area.color === 'primary' ? 'text-primary-600' :
                    area.color === 'success' ? 'text-success-600' :
                    area.color === 'secondary' ? 'text-secondary-600' :
                    area.color === 'warning' ? 'text-warning-600' :
                    area.color === 'danger' ? 'text-danger-600' :
                    'text-default-600'
                  }`}>
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{area.title}</h3>
                <ul className="space-y-1">
                  {area.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="text-sm text-gray-600 flex items-center">
                      <span className="text-gray-400 mr-2">•</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Study Tips */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Effective Study Strategies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proven tips to help you master the prerequisites and prepare effectively for mathematical olympiads
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studyTips.map((tip, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                <div className="text-4xl mb-4">{tip.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{tip.title}</h3>
                <p className="text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Assess Your Skills?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Take our comprehensive diagnostic test to evaluate your current mathematical proficiency across all prerequisite areas.
          </p>
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Free Diagnostic Assessment</h3>
                          <p className="text-primary-100 mb-6">
              Get a detailed report of your strengths and areas that need attention in each prerequisite category
            </p>
            <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Take Assessment
            </button>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              What&apos;s Next?
            </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">If You Meet Prerequisites</h3>
              <p className="text-gray-600 mb-4">
                You&apos;re ready to start our comprehensive curriculum designed for olympiad preparation.
              </p>
              <a href="/curriculum" className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                Explore Curriculum
              </a>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Ready to Enroll?</h3>
              <p className="text-gray-600 mb-4">
                Join our program and start your journey towards mathematical olympiad success.
              </p>
              <a href="/join" className="inline-block bg-success-600 text-white px-6 py-2 rounded-lg hover:bg-success-700 transition-colors duration-200">
                Enroll Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Public Video Player Modal */}
      {selectedVideo && (
        <PublicVideoPlayer
          isOpen={showVideoPlayer}
          onClose={() => {
            setShowVideoPlayer(false)
            setSelectedVideo(null)
          }}
          videoUrl={selectedVideo.videoLink || ''}
          title={selectedVideo.concept}
          description={`${selectedVideo.chapter} • ${selectedVideo.topic} • ${selectedVideo.unit} • ${selectedVideo.level}`}
        />
      )}
    </div>
  );
}
