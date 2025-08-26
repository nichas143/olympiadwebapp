'use client';

import { useState } from 'react';
import { Select, SelectItem } from "@heroui/react";

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

export default function SampleLessons() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);

  const filteredLessons = sampleLessons.filter(lesson => {
    const categoryMatch = selectedCategory === 'All' || lesson.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'All' || lesson.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

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
                // label="Category"
                placeholder="Select a category"
                color='primary'
                // selectedKeys={[selectedCategory]}
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
                // label="Difficulty"
                placeholder="Select difficulty"
                // selectedKeys={[selectedDifficulty]}
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
                <div
                  key={lesson.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => setSelectedVideo(lesson)}
                >
                  <div className="relative">
                    <img
                      src={`https://img.youtube.com/vi/${lesson.youtubeId}/maxresdefault.jpg`}
                      alt={lesson.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://img.youtube.com/vi/${lesson.youtubeId}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
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
                  
                  <div className="p-4">
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
                  </div>
                </div>
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
