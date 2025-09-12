'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardBody, Chip, Button, Spinner } from '@heroui/react'
import { CalendarIcon, ClockIcon, EyeIcon, TagIcon, ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

interface Blog {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  author: string
  tags: string[]
  category: string
  readTime: number
  views: number
  publishedAt: string
  featuredImage?: string
  seoTitle?: string
  seoDescription?: string
  metaKeywords?: string[]
}

interface BlogResponse {
  success: boolean
  blog?: Blog
  error?: string
}

// Component to render content with LaTeX support
function BlogContent({ content }: { content: string }) {
  // Split content by LaTeX delimiters and render accordingly
  const renderContent = (text: string) => {
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$)/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math
        const mathContent = part.slice(2, -2).trim()
        return (
          <div key={index} className="my-4">
            <BlockMath math={mathContent} />
          </div>
        )
      } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        // Inline math
        const mathContent = part.slice(1, -1).trim()
        return <InlineMath key={index} math={mathContent} />
      } else {
        // Regular text - convert line breaks to paragraphs
        const paragraphs = part.split('\n\n').filter(p => p.trim())
        return paragraphs.map((paragraph, pIndex) => (
          <p key={`${index}-${pIndex}`} className="mb-4 leading-relaxed">
            {paragraph.split('\n').map((line, lIndex, lines) => (
              <span key={lIndex}>
                {line}
                {lIndex < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        ))
      }
    })
  }

  return <div className="prose prose-lg max-w-none">{renderContent(content)}</div>
}

export default function BlogPostPage() {
  const params = useParams()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/blog/${params.slug}`)
        const data: BlogResponse = await response.json()
        
        if (data.success && data.blog) {
          setBlog(data.blog)
          // Update page title and meta
          document.title = data.blog.seoTitle || data.blog.title
          const metaDescription = document.querySelector('meta[name="description"]')
          if (metaDescription) {
            metaDescription.setAttribute('content', data.blog.seoDescription || data.blog.excerpt)
          }
        } else {
          setError(data.error || 'Blog not found')
        }
      } catch (error) {
        console.error('Error fetching blog:', error)
        setError('Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchBlog()
    }
  }, [params.slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
      'Mathematics': 'primary',
      'Olympiad': 'secondary',
      'Problem Solving': 'success',
      'Study Tips': 'warning',
      'Announcements': 'danger',
      'General': 'default'
    }
    return colors[category] || 'default'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-600">Loading blog post...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardBody className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
              <p className="text-gray-600 mb-6">
                {error || 'The blog post you are looking for does not exist or has been removed.'}
              </p>
              <Button
                as={Link}
                href="/blog"
                color="primary"
                startContent={<ArrowLeftIcon className="h-4 w-4" />}
              >
                Back to Blog
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            as={Link}
            href="/blog"
            variant="light"
            startContent={<ArrowLeftIcon className="h-4 w-4" />}
          >
            Back to Blog
          </Button>
        </div>

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="mb-8">
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Blog Header */}
        <Card className="mb-8">
          <CardBody className="p-8">
            <div className="mb-4">
              <Chip
                color={getCategoryColor(blog.category)}
                variant="flat"
                size="lg"
              >
                {blog.category}
              </Chip>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-6">
              {blog.excerpt}
            </p>
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                <span>{blog.readTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <EyeIcon className="h-4 w-4" />
                <span>{blog.views} views</span>
              </div>
            </div>
            
            {/* Tags */}
            {blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <Chip
                    key={tag}
                    size="sm"
                    variant="flat"
                    color="default"
                    startContent={<TagIcon className="h-3 w-3" />}
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Blog Content */}
        <Card>
          <CardBody className="p-8">
            <BlogContent content={blog.content} />
          </CardBody>
        </Card>

        {/* Back to Blog */}
        <div className="mt-8 text-center">
          <Button
            as={Link}
            href="/blog"
            color="primary"
            variant="flat"
            startContent={<ArrowLeftIcon className="h-4 w-4" />}
          >
            Back to All Posts
          </Button>
        </div>
      </div>
    </div>
  )
}
