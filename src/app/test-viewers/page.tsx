'use client'

import { useState } from 'react'
import { Button, Card, CardBody, Input } from "@heroui/react"
import ContentViewer from '../components/ContentViewer'

const testContents = [
    {
      _id: 'test-pdf',
      title: 'Test PDF',
      description: 'Testing PDF viewer functionality',
      contentType: 'pdf' as const,
      videoLink: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
      concept: 'Test PDF Concept',
      chapter: 'Test Chapter',
      topic: 'Test Topic',
      unit: 'Algebra' as const
    },
    {
      _id: 'test-video',
      title: 'Test Video',
      description: 'Testing video player functionality',
      contentType: 'video' as const,
      videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      concept: 'Test Video Concept',
      chapter: 'Test Chapter',
      topic: 'Test Topic',
      unit: 'Geometry' as const
    },
    {
      _id: 'test-link',
      title: 'Test Link',
      description: 'Testing external link functionality',
      contentType: 'link' as const,
      videoLink: 'https://www.google.com',
      concept: 'Test Link Concept',
      chapter: 'Test Chapter',
      topic: 'Test Topic',
      unit: 'Number Theory' as const
    }
  ]

export default function TestViewersPage() {
  const [showContentViewer, setShowContentViewer] = useState(false)
  const [testContent, setTestContent] = useState<(typeof testContents)[0]>({
    _id: 'test-content',
    title: 'Test Content',
    description: 'This is a test content for debugging',
    contentType: 'pdf' as const,
    videoLink: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
    concept: 'Test Concept',
    chapter: 'Test Chapter',
    topic: 'Test Topic',
    unit: 'Algebra' as const
  })

  const handleTestContent = (content: (typeof testContents)[0]) => {
    console.log('Testing content:', content)
    setTestContent(content)
    setShowContentViewer(true)
  }

  const handleAttemptUpdate = (contentId: string, attempted: boolean) => {
    console.log('Attempt update:', { contentId, attempted })
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Viewer Test Page</h1>
      
      <div className="grid gap-4 mb-6">
        {testContents.map((content) => (
          <Card key={content._id}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{content.title}</h3>
                  <p className="text-gray-600">{content.description}</p>
                  <p className="text-sm text-gray-500">
                    Type: {content.contentType} • URL: {content.videoLink}
                  </p>
                </div>
                <Button
                  color="primary"
                  onPress={() => handleTestContent(content)}
                >
                  Test {content.contentType.toUpperCase()}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold mb-4">Manual Test</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Content Type</label>
              <select 
                className="w-full p-2 border rounded"
                value={testContent.contentType}
                onChange={(e) => setTestContent(prev => ({ ...prev, contentType: e.target.value as any }))}
              >
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
                <option value="testpaperLink">Test Paper</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">URL</label>
              <Input
                value={testContent.videoLink}
                onChange={(e) => setTestContent(prev => ({ ...prev, videoLink: e.target.value }))}
                placeholder="Enter URL"
              />
            </div>
            <Button
              color="primary"
              onPress={() => setShowContentViewer(true)}
            >
              Test Manual Content
            </Button>
          </div>
        </CardBody>
      </Card>

      <ContentViewer
        isOpen={showContentViewer}
        onClose={() => setShowContentViewer(false)}
        content={testContent}
        onAttemptUpdate={handleAttemptUpdate}
      />
    </div>
  )
}
