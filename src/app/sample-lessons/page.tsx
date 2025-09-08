'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Badge, Chip } from "@heroui/react";
import { PlayCircleIcon, ClockIcon, AcademicCapIcon, DocumentIcon } from '@heroicons/react/24/outline';
import PublicVideoPlayer from '@/app/components/PublicVideoPlayer';
import { usePublicContent } from '@/hooks/usePublicContent';

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

export default function SampleLessons() {
  const [selectedVideo, setSelectedVideo] = useState<Content | null>(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)

  // Fetch public videos (all levels, we'll filter out prerequisites)
  const { content: publicVideos, loading: videosLoading, error: videosError } = usePublicContent({
    level: 'all', // Fetch all levels
    contentType: 'video',
    sortBy: 'sequence',
    limit: 50
  })

  // Fetch public PDFs (all levels, we'll filter out prerequisites)
  const { content: publicPDFs, loading: pdfsLoading, error: pdfsError } = usePublicContent({
    level: 'all', // Fetch all levels
    contentType: 'pdf',
    sortBy: 'sequence',
    limit: 50
  })

  // Filter out prerequisite content
  const filteredVideos = publicVideos?.filter(video => video.level !== 'Pre-requisite') || []
  const filteredPDFs = publicPDFs?.filter(pdf => pdf.level !== 'Pre-requisite') || []

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

  const handlePDFAction = (pdf: Content) => {
    if (pdf.videoLink) {
      window.open(pdf.videoLink, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Sample Lessons
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Experience our teaching methodology with these carefully curated sample lessons. 
              Get a preview of the quality and depth of our mathematical olympiad program.
            </p>
          </div>
        </div>
      </section>

      {/* Sample Video Lessons */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sample Video Lectures
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Watch these sample video lectures to understand our teaching approach and content quality.
            </p>
          </div>

          {videosLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading sample lessons...</p>
              </div>
            </div>
          ) : videosError ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading sample lessons. Please try again later.</p>
            </div>
          ) : filteredVideos && filteredVideos.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => {
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
                        <div className="absolute top-2 left-2">
                          <Chip size="sm" color="secondary" variant="solid">
                            {video.sequenceNo}
                          </Chip>
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge color="primary" variant="flat" size="sm">
                          {video.unit}
                        </Badge>
                        <Badge 
                          color={
                            video.level === 'Beginner' ? 'success' : 
                            video.level === 'Intermediate' ? 'warning' : 'danger'
                          } 
                          variant="flat" 
                          size="sm"
                        >
                          {video.level}
                        </Badge>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sample Lessons Available</h3>
              <p className="text-gray-600">Check back later for sample video lessons.</p>
          </div>
          )}
        </div>
      </section>

      {/* Sample Study Materials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sample Study Materials
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore these sample PDF resources to understand the depth and quality of our study materials.
            </p>
            </div>

          {pdfsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading sample materials...</p>
              </div>
            </div>
          ) : pdfsError ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading sample materials. Please try again later.</p>
            </div>
          ) : filteredPDFs && filteredPDFs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPDFs.map((pdf) => (
                <Card key={pdf._id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="p-0">
                    <div className="relative w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden flex items-center justify-center">
                      <div className="text-center">
                        <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">PDF Document</p>
                        </div>
                      <div className="absolute top-2 left-2">
                        <Chip size="sm" color="secondary" variant="solid">
                          {pdf.sequenceNo}
                        </Chip>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Chip size="sm" color="primary" variant="solid">
                          {formatDuration(pdf.duration)}
                        </Chip>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge color="primary" variant="flat" size="sm">
                        {pdf.unit}
                      </Badge>
                      <Badge 
                        color={
                          pdf.level === 'Beginner' ? 'success' : 
                          pdf.level === 'Intermediate' ? 'warning' : 'danger'
                        } 
                        variant="flat" 
                        size="sm"
                      >
                        {pdf.level}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {pdf.concept}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {pdf.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {pdf.chapter} • {pdf.topic}
                      </div>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => handlePDFAction(pdf)}
                        startContent={<DocumentIcon className="h-4 w-4" />}
                      >
                        View PDF
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sample Materials Available</h3>
              <p className="text-gray-600">Check back later for sample study materials.</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Join Our Program?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Experience the full depth of our mathematical olympiad program with comprehensive lessons, 
            practice problems, and expert guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary-600 hover:bg-gray-100 font-semibold"
              onPress={() => window.location.href = '/join'}
            >
              Join Our Program
            </Button>
            <Button 
              size="lg" 
              variant="bordered" 
              className="border-white text-white hover:bg-white hover:text-primary-600 font-semibold"
              onPress={() => window.location.href = '/prerequisites'}
            >
              View Prerequisites
            </Button>
          </div>
        </div>
      </section>

      {/* Video Player Modal */}
      {showVideoPlayer && selectedVideo && (
        <PublicVideoPlayer
          videoUrl={selectedVideo.videoLink || ''}
          title={selectedVideo.concept}
          description={selectedVideo.description}
          isOpen={showVideoPlayer}
          onClose={() => {
            setShowVideoPlayer(false)
            setSelectedVideo(null)
          }}
        />
      )}
    </div>
  )
}