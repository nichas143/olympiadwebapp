'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Select, SelectItem, Card, CardBody, CardHeader, Button } from "@heroui/react";

interface VideoLesson {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  youtubeId: string;
}

const sampleLessons: VideoLesson[] = [
  {
    id: '1',
    title: 'Introduction to Number Theory',
    description: 'Learn the fundamentals of number theory including divisibility, prime numbers, and modular arithmetic.',
    category: 'Number Theory',
    duration: '45 min',
    difficulty: 'Beginner',
    youtubeId: 'dQw4w9WgXcQ' // Replace with actual YouTube video ID
  },
  {
    id: '2',
    title: 'Geometric Constructions',
    description: 'Master the art of geometric constructions using compass and straightedge.',
    category: 'Geometry',
    duration: '38 min',
    difficulty: 'Beginner',
    youtubeId: 'dQw4w9WgXcQ' // Replace with actual YouTube video ID
  },
  {
    id: '3',
    title: 'Miquel\'s theorem',
    description: 'Miquels Point and Theorem.',
    category: 'Geometry',
    duration: '6 min',
    difficulty: 'Intermediate',
    youtubeId: 'V1wbNqiw8a4' // Replace with actual YouTube video ID
  },
  {
    id: '4',
    title: 'Combinatorial Counting',
    description: 'Learn advanced counting techniques and combinatorial principles.',
    category: 'Combinatorics',
    duration: '41 min',
    difficulty: 'Intermediate',
    youtubeId: 'dQw4w9WgXcQ' // Replace with actual YouTube video ID
  },
  {
    id: '5',
    title: 'Functional Equations',
    description: 'Solve functional equations using various techniques and strategies.',
    category: 'Functions',
    duration: '48 min',
    difficulty: 'Advanced',
    youtubeId: 'dQw4w9WgXcQ' // Replace with actual YouTube video ID
  },
  {
    id: '6',
    title: 'Olympiad Problem Solving Strategies',
    description: 'Learn systematic approaches to tackle challenging olympiad problems.',
    category: 'Problem Solving',
    duration: '55 min',
    difficulty: 'Advanced',
    youtubeId: 'dQw4w9WgXcQ' // Replace with actual YouTube video ID
  }
];

const categories = ['All', 'Number Theory', 'Geometry', 'Algebra', 'Combinatorics', 'Functions', 'Problem Solving'];
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

// Toggle this to false when you're ready to show the full video lessons
const SHOW_WORK_IN_PROGRESS = true;

export default function SampleLessons() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const filteredLessons = sampleLessons.filter(lesson => {
    const categoryMatch = selectedCategory === 'All' || lesson.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'All' || lesson.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const handleImageError = (lessonId: string) => {
    setImageErrors(prev => ({ ...prev, [lessonId]: true }));
  };

  // Work in Progress Page
  if (SHOW_WORK_IN_PROGRESS) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white bg-opacity-20 rounded-full mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Sample Lessons
              </h1>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
                We're crafting amazing video lessons to give you a taste of our teaching methodology. 
                Stay tuned for engaging content that will transform your mathematical olympiad journey.
              </p>
            </div>
          </div>
        </section>

        {/* Work in Progress Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Coming Soon!
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our team of expert educators is working hard to create high-quality video lessons 
                that will help you master mathematical olympiad concepts.
              </p>
            </div>

            {/* Progress Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </CardHeader>
                <CardBody>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Content Creation</h3>
                  <p className="text-gray-600">
                    Recording and editing high-quality video lessons with clear explanations
                  </p>
                </CardBody>
              </Card>

              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </CardHeader>
                <CardBody>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                  <p className="text-gray-600">
                    Reviewing and testing content to ensure accuracy and effectiveness
                  </p>
                </CardBody>
              </Card>

              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </CardHeader>
                <CardBody>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Platform Integration</h3>
                  <p className="text-gray-600">
                    Setting up the video player and progress tracking systems
                  </p>
                </CardBody>
              </Card>
            </div>

            {/* What to Expect */}
            <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-0">
              <CardBody className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  What You Can Expect
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Interactive Video Lessons</h4>
                        <p className="text-gray-600 text-sm">Engaging content with clear explanations and examples</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Multiple Difficulty Levels</h4>
                        <p className="text-gray-600 text-sm">From beginner to advanced olympiad problems</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Progress Tracking</h4>
                        <p className="text-gray-600 text-sm">Monitor your learning journey and achievements</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Expert Instructors</h4>
                        <p className="text-gray-600 text-sm">Learn from experienced olympiad coaches and mathematicians</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Get Notified When We Launch
            </h2>
            <p className="text-xl mb-8 text-primary-100">
              Be the first to know when our sample lessons are ready. Join our community and stay updated!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                color="default"
                variant="solid"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold"
                onPress={() => window.location.href = '/join'}
              >
                Join Waitlist
              </Button>
              <Button
                size="lg"
                variant="bordered"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold"
                onPress={() => window.location.href = '/curriculum'}
              >
                View Full Curriculum
              </Button>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600">
              We're working hard to bring you the best learning experience. Thank you for your patience!
            </p>
          </div>
        </section>
      </div>
    );
  }

  // Full Video Lessons Page
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Sample Video Lessons
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Experience our teaching methodology through these carefully curated sample lessons. 
              Get a taste of our comprehensive curriculum designed for mathematical olympiad success.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                placeholder="Select a category"
                color='primary'
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setSelectedCategory(selected);
                }}
                className="w-full sm:w-48"
                variant="underlined"
                size="md"
                classNames={{
                  base: "w-full sm:w-48",
                  trigger: "bg-white border-gray-300 hover:border-gray-400 focus:border-primary-500",
                  listbox: "bg-white border border-gray-300 shadow-2xl rounded-lg z-[9999]",
                  listboxWrapper: "bg-white rounded-lg",
                  popoverContent: "bg-white rounded-lg shadow-2xl border border-gray-200 z-[9999]",
                  selectorIcon: "text-foreground-500",
                  value: "text-gray-900 font-medium",
                  label: "text-primary-700 font-medium"
                }}
              >
                {categories.map(category => (
                  <SelectItem 
                    key={category}
                    className="text-gray-900 font-medium hover:bg-gray-100"
                  >
                    {category}
                  </SelectItem>
                ))}
              </Select>
              
              <Select
                placeholder="Select difficulty"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setSelectedDifficulty(selected);
                }}
                className="w-full sm:w-48"
                variant="bordered"
                size="md"
                classNames={{
                  base: "w-full sm:w-48",
                  trigger: "bg-white border-gray-300 hover:border-gray-400 focus:border-primary-500",
                  listbox: "bg-white border border-gray-300 shadow-2xl rounded-lg z-[9999]",
                  listboxWrapper: "bg-white rounded-lg",
                  popoverContent: "bg-white rounded-lg shadow-2xl border border-gray-200 z-[9999]",
                  selectorIcon: "text-gray-500",
                  value: "text-gray-900 font-medium",
                  label: "text-gray-700 font-medium"
                }}
              >
                {difficulties.map(difficulty => (
                  <SelectItem 
                    key={difficulty}
                    className="text-gray-900 font-medium hover:bg-gray-100"
                  >
                    {difficulty}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedVideo.title}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-4">
                <h4 className="text-xl font-semibold mb-2">{selectedVideo.title}</h4>
                <p className="text-gray-600 mb-3">{selectedVideo.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Category: {selectedVideo.category}</span>
                  <span>Duration: {selectedVideo.duration}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedVideo.difficulty === 'Beginner' ? 'bg-success-100 text-success-800' :
                    selectedVideo.difficulty === 'Intermediate' ? 'bg-primary-100 text-primary-800' :
                    'bg-secondary-100 text-secondary-800'
                  }`}>
                    {selectedVideo.difficulty}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredLessons.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No lessons found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more lessons.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson) => (
                <Card
                  key={lesson.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  isPressable
                  onPress={() => setSelectedVideo(lesson)}
                >
                  <CardHeader className="pb-0 px-3">
                    <div className="relative w-full h-48">
                      <Image
                        src={imageErrors[lesson.id] 
                          ? `https://img.youtube.com/vi/${lesson.youtubeId}/hqdefault.jpg`
                          : `https://img.youtube.com/vi/${lesson.youtubeId}/maxresdefault.jpg`
                        }
                        alt={lesson.title}
                        fill
                        className="object-cover object-center rounded-lg"
                        onError={() => handleImageError(lesson.id)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <div className="bg-white bg-opacity-90 rounded-full p-3 flex items-center justify-center w-16 h-16">
                          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                          lesson.difficulty === 'Beginner' ? 'bg-success-600' :
                          lesson.difficulty === 'Intermediate' ? 'bg-primary-600' :
                          'bg-secondary-600'
                        }`}>
                          {lesson.difficulty}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardBody>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
                      {lesson.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {lesson.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{lesson.category}</span>
                      <span>{lesson.duration}</span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join the Full Program?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Get access to our complete curriculum with hundreds of video lessons, practice problems, and expert guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/join"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-block"
            >
              Enroll Now
            </a>
            <a
              href="/curriculum"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200 inline-block"
            >
              View Full Curriculum
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
