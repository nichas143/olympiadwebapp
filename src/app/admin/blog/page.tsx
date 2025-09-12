'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableColumn, 
  TableHeader, 
  TableRow,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Pagination,
  Spinner,
  useDisclosure
} from '@heroui/react'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { z } from 'zod'

interface Blog {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  author: string
  authorId: string
  tags: string[]
  category: string
  status: 'draft' | 'published' | 'archived'
  readTime: number
  views: number
  isPublic: boolean
  seoTitle?: string
  seoDescription?: string
  metaKeywords?: string[]
  publishedAt?: string
  createdAt: string
  updatedAt: string
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

const blogFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'), // Allow any content length for drafts
  excerpt: z.string().min(1, 'Excerpt is required').max(500, 'Excerpt too long'),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional().default([]),
  category: z.enum(['Mathematics', 'Olympiad', 'Problem Solving', 'Study Tips', 'Announcements', 'General']),
  status: z.enum(['draft', 'published']),
  readTime: z.number().min(1, 'Read time must be at least 1 minute').max(120, 'Read time too long'),
  isPublic: z.boolean().default(true),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  metaKeywords: z.array(z.string()).max(15, 'Maximum 15 meta keywords allowed').optional().default([])
}).refine((data) => {
  // Only require 100+ characters for published blogs
  if (data.status === 'published' && data.content.length < 100) {
    return false
  }
  return true
}, {
  message: "Content must be at least 100 characters for published blogs",
  path: ["content"]
})

type BlogFormData = {
  title: string
  content: string
  excerpt: string
  tags: string // Keep as string for form input
  category: 'Mathematics' | 'Olympiad' | 'Problem Solving' | 'Study Tips' | 'Announcements' | 'General'
  status: 'draft' | 'published'
  readTime: number
  isPublic: boolean
  seoTitle: string
  seoDescription: string
  metaKeywords: string // Keep as string for form input
}

const categories = [
  { key: 'Mathematics', label: 'Mathematics' },
  { key: 'Olympiad', label: 'Olympiad' },
  { key: 'Problem Solving', label: 'Problem Solving' },
  { key: 'Study Tips', label: 'Study Tips' },
  { key: 'Announcements', label: 'Announcements' },
  { key: 'General', label: 'General' }
]

export default function AdminBlogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<BlogResponse['pagination'] | null>(null)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    category: 'Mathematics',
    status: 'draft',
    readTime: 5,
    isPublic: true,
    seoTitle: '',
    seoDescription: '',
    metaKeywords: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      router.push('/auth/signin')
      return
    }
    
    fetchBlogs()
  }, [session, status, router, selectedStatus, currentPage])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus)
      }
      
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

  const handleCreateNew = () => {
    setEditingBlog(null)
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      tags: '',
      category: 'Mathematics',
      status: 'draft',
      readTime: 5,
      isPublic: true,
      seoTitle: '',
      seoDescription: '',
      metaKeywords: ''
    })
    setFormErrors({})
    onModalOpen()
  }

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title,
      content: blog.content, // Load the actual content
      excerpt: blog.excerpt,
      tags: blog.tags.join(', '),
      category: blog.category as any,
      status: blog.status as any,
      readTime: blog.readTime,
      isPublic: blog.isPublic || true,
      seoTitle: blog.seoTitle || '',
      seoDescription: blog.seoDescription || '',
      metaKeywords: blog.metaKeywords?.join(', ') || ''
    })
    setFormErrors({})
    onModalOpen()
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setFormErrors({})

      // Parse tags and keywords
      const tags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      const metaKeywords = formData.metaKeywords ? formData.metaKeywords.split(',').map(kw => kw.trim()).filter(Boolean) : []

      const submitData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        tags,
        category: formData.category,
        status: formData.status,
        readTime: formData.readTime,
        isPublic: formData.isPublic,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        metaKeywords
      }

      const validatedData = blogFormSchema.parse(submitData)

      const url = editingBlog ? `/api/blog/${editingBlog._id}` : '/api/blog'
      const method = editingBlog ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validatedData)
      })

      const result = await response.json()

      if (result.success) {
        onModalClose()
        fetchBlogs()
      } else {
        if (result.details) {
          const errors: Record<string, string> = {}
          result.details.forEach((error: any) => {
            errors[error.path[0]] = error.message
          })
          setFormErrors(errors)
        } else {
          setFormErrors({ general: result.error || 'Failed to save blog' })
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach((err) => {
          errors[err.path[0]] = err.message
        })
        setFormErrors(errors)
      } else {
        setFormErrors({ general: 'An unexpected error occurred' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/blog/${blogId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        fetchBlogs()
      } else {
        alert(result.error || 'Failed to delete blog')
      }
    } catch (error) {
      console.error('Error deleting blog:', error)
      alert('Failed to delete blog')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success'
      case 'draft': return 'warning'
      case 'archived': return 'default'
      default: return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading blog management...</p>
        </div>
      </div>
    )
  }

  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
              <p className="mt-2 text-gray-600">Create and manage blog posts</p>
            </div>
            <Button
              color="primary"
              startContent={<PlusIcon className="h-5 w-5" />}
              onPress={handleCreateNew}
            >
              New Blog Post
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <h2 className="text-xl font-semibold">Blog Posts</h2>
              <div className="text-sm text-gray-500">
                Total: {pagination?.total || 0} posts
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Tabs 
              selectedKey={selectedStatus} 
              onSelectionChange={(key) => {
                setSelectedStatus(key as string)
                setCurrentPage(1)
              }}
              className="mb-6"
            >
              <Tab key="all" title="All Posts" />
              <Tab key="published" title="Published" />
              <Tab key="draft" title="Drafts" />
              <Tab key="archived" title="Archived" />
            </Tabs>

            <Table aria-label="Blog posts table">
              <TableHeader>
                <TableColumn>TITLE</TableColumn>
                <TableColumn>CATEGORY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>AUTHOR</TableColumn>
                <TableColumn>VIEWS</TableColumn>
                <TableColumn>PUBLISHED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No blog posts found">
                {blogs.map((blog) => (
                  <TableRow key={blog._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{blog.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{blog.excerpt}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="primary">
                        {blog.category}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        color={getStatusColor(blog.status)} 
                        variant="flat"
                        size="sm"
                      >
                        {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{blog.author}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{blog.views}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {blog.publishedAt ? formatDate(blog.publishedAt) : 'Not published'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {blog.status === 'published' && (
                          <Button
                            as={Link}
                            href={`/blog/${blog.slug}`}
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<EyeIcon className="h-4 w-4" />}
                          >
                            View
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="flat"
                          color="secondary"
                          startContent={<PencilIcon className="h-4 w-4" />}
                          onPress={() => handleEdit(blog)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          startContent={<TrashIcon className="h-4 w-4" />}
                          onPress={() => handleDelete(blog._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  total={pagination.totalPages}
                  page={currentPage}
                  onChange={setCurrentPage}
                  showControls
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Create/Edit Modal */}
        <Modal isOpen={isModalOpen} onClose={onModalClose} size="5xl" scrollBehavior="inside">
          <ModalContent>
            <ModalHeader>
              {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
            </ModalHeader>
            <ModalBody>
              {formErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {formErrors.general}
                </div>
              )}
              
              <div className="space-y-4">
                <Input
                  label="Title"
                  placeholder="Enter blog title"
                  value={formData.title}
                  onValueChange={(value) => setFormData({ ...formData, title: value })}
                  errorMessage={formErrors.title}
                  isInvalid={!!formErrors.title}
                />
                
                <Textarea
                  label="Excerpt"
                  placeholder="Brief description of the blog post"
                  value={formData.excerpt}
                  onValueChange={(value) => setFormData({ ...formData, excerpt: value })}
                  errorMessage={formErrors.excerpt}
                  isInvalid={!!formErrors.excerpt}
                  maxRows={3}
                />
                
                <Textarea
                  label="Content"
                  placeholder="Write your blog content here. Use $ for inline math and $$ for block math."
                  value={formData.content}
                  onValueChange={(value) => setFormData({ ...formData, content: value })}
                  errorMessage={formErrors.content}
                  isInvalid={!!formErrors.content}
                  minRows={10}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Category"
                    selectedKeys={[formData.category]}
                    onSelectionChange={(keys) => setFormData({ ...formData, category: Array.from(keys)[0] as any })}
                    errorMessage={formErrors.category}
                    isInvalid={!!formErrors.category}
                  >
                    {categories.map((category) => (
                      <SelectItem key={category.key}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </Select>
                  
                  <Select
                    label="Status"
                    selectedKeys={[formData.status]}
                    onSelectionChange={(keys) => setFormData({ ...formData, status: Array.from(keys)[0] as any })}
                    errorMessage={formErrors.status}
                    isInvalid={!!formErrors.status}
                  >
                    <SelectItem key="draft">Draft</SelectItem>
                    <SelectItem key="published">Published</SelectItem>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Tags (comma-separated)"
                    placeholder="math, olympiad, problem-solving"
                    value={formData.tags}
                    onValueChange={(value) => setFormData({ ...formData, tags: value })}
                    errorMessage={formErrors.tags}
                    isInvalid={!!formErrors.tags}
                  />
                  
                  <Input
                    label="Read Time (minutes)"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.readTime.toString()}
                    onValueChange={(value) => setFormData({ ...formData, readTime: parseInt(value) || 5 })}
                    errorMessage={formErrors.readTime}
                    isInvalid={!!formErrors.readTime}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="SEO Title (optional)"
                    placeholder="Custom title for search engines"
                    value={formData.seoTitle}
                    onValueChange={(value) => setFormData({ ...formData, seoTitle: value })}
                    errorMessage={formErrors.seoTitle}
                    isInvalid={!!formErrors.seoTitle}
                  />
                  
                  <Input
                    label="Meta Keywords (comma-separated)"
                    placeholder="keyword1, keyword2, keyword3"
                    value={formData.metaKeywords}
                    onValueChange={(value) => setFormData({ ...formData, metaKeywords: value })}
                    errorMessage={formErrors.metaKeywords}
                    isInvalid={!!formErrors.metaKeywords}
                  />
                </div>
                
                <Textarea
                  label="SEO Description (optional)"
                  placeholder="Brief description for search engines"
                  value={formData.seoDescription}
                  onValueChange={(value) => setFormData({ ...formData, seoDescription: value })}
                  errorMessage={formErrors.seoDescription}
                  isInvalid={!!formErrors.seoDescription}
                  maxRows={2}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onModalClose}>
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleSubmit}
                isLoading={submitting}
              >
                {editingBlog ? 'Update' : 'Create'} Blog Post
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  )
}
