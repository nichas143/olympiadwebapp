'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardBody, Chip, Button, Spinner } from '@heroui/react'
import { CalendarIcon, ClockIcon, EyeIcon, TagIcon, ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline'
import 'katex/dist/katex.min.css'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'
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

// Component to render content with full markdown and LaTeX support
function BlogContent({ content }: { content: string }) {
  // Process LaTeX expressions and create a mixed content array
  const processContent = (text: string) => {
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
        // Regular text - render as markdown
        return (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              // Custom styling for code blocks
              code({ className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '')
                const isInline = !match
                return !isInline ? (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="bg-pink-50 text-pink-600 px-1 py-0.5 rounded text-sm" {...props}>
                    {children}
                  </code>
                )
              },
              // Custom styling for blockquotes
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">
                    {children}
                  </blockquote>
                )
              },
              // Custom styling for tables
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-6">
                    <table className="min-w-full border-collapse border border-gray-200">
                      {children}
                    </table>
                  </div>
                )
              },
              th({ children }) {
                return (
                  <th className="bg-gray-50 font-semibold text-left px-3 py-2 border border-gray-200">
                    {children}
                  </th>
                )
              },
              td({ children }) {
                return (
                  <td className="px-3 py-2 border border-gray-200">
                    {children}
                  </td>
                )
              },
              // Custom styling for images
              img({ src, alt, ...props }) {
                return (
                  <img
                    src={src}
                    alt={alt}
                    className="max-w-full h-auto rounded-lg shadow-md my-4"
                    {...props}
                  />
                )
              },
              // Custom styling for links
              a({ href, children, ...props }) {
                return (
                  <a
                    href={href}
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    {...props}
                  >
                    {children}
                  </a>
                )
              }
            }}
          >
            {part}
          </ReactMarkdown>
        )
      }
    })
  }

  return (
    <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-strong:font-semibold prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-700 prose-table:text-sm prose-th:bg-gray-50 prose-th:font-semibold prose-td:border prose-td:border-gray-200 prose-td:px-3 prose-td:py-2">
      {processContent(content)}
    </div>
  )
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
