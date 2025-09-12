'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardBody, CardHeader, Chip, Button, Input, Select, SelectItem, Pagination, Spinner } from '@heroui/react'
import { MagnifyingGlassIcon, CalendarIcon, ClockIcon, EyeIcon, TagIcon } from '@heroicons/react/24/outline'

interface Blog {
  _id: string
  title: string
  slug: string
  excerpt: string
  author: string
  tags: string[]
  category: string
  readTime: number
  views: number
  publishedAt: string
  featuredImage?: string
  createdAt: string
}

interface BlogResponse {
  success: boolean
  blogs: Blog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const categories = [
  { key: '', label: 'All Categories' },
  { key: 'Mathematics', label: 'Mathematics' },
  { key: 'Olympiad', label: 'Olympiad' },
  { key: 'Problem Solving', label: 'Problem Solving' },
  { key: 'Study Tips', label: 'Study Tips' },
  { key: 'Announcements', label: 'Announcements' },
  { key: 'General', label: 'General' }
]

function BlogPageContent() {
  const searchParams = useSearchParams()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [pagination, setPagination] = useState<BlogResponse['pagination'] | null>(null)

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '9'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)
      
      const response = await fetch(`/api/blog?${params}`)
      const data: BlogResponse = await response.json()
      
      if (data.success) {
        setBlogs(data.blogs)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [currentPage, searchTerm, selectedCategory])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPage(1)
  }

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

  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-600">Loading blogs...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📚 Math Olympiad Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover insights, problem-solving strategies, and mathematical concepts 
            from our expert instructors and community.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <Card>
            <CardBody>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onValueChange={handleSearch}
                    startContent={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "h-12"
                    }}
                  />
                </div>
                <div className="w-full md:w-64">
                  <Select
                    placeholder="Select category"
                    selectedKeys={selectedCategory ? [selectedCategory] : []}
                    onSelectionChange={(keys) => handleCategoryChange(Array.from(keys)[0] as string)}
                    classNames={{
                      trigger: "h-12"
                    }}
                  >
                    {categories.map((category) => (
                      <SelectItem key={category.key}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Results Count */}
        {pagination && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {((currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(currentPage * pagination.limit, pagination.total)} of{' '}
              {pagination.total} blogs
            </p>
          </div>
        )}

        {/* Blog Grid */}
        {blogs.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Check back soon for new blog posts!'
                }
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {blogs.map((blog) => (
              <Card key={blog._id} className="h-full hover:shadow-lg transition-shadow duration-300">
                {blog.featuredImage && (
                  <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <Chip
                        size="sm"
                        color={getCategoryColor(blog.category)}
                        variant="flat"
                      >
                        {blog.category}
                      </Chip>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      <Link 
                        href={`/blog/${blog.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {blog.title}
                      </Link>
                    </h3>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  
                  {/* Tags */}
                  {blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {blog.tags.slice(0, 3).map((tag) => (
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
                      {blog.tags.length > 3 && (
                        <Chip size="sm" variant="flat" color="default">
                          +{blog.tags.length - 3}
                        </Chip>
                      )}
                    </div>
                  )}
                  
                  {/* Meta Information */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formatDate(blog.publishedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{blog.readTime} min</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <EyeIcon className="h-3 w-3" />
                      <span>{blog.views}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Button
                      as={Link}
                      href={`/blog/${blog.slug}`}
                      color="primary"
                      variant="flat"
                      size="sm"
                      className="w-full"
                    >
                      Read More
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              total={pagination.totalPages}
              page={currentPage}
              onChange={setCurrentPage}
              showControls
              showShadow
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-600">Loading blogs...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <BlogPageContent />
    </Suspense>
  )
}
