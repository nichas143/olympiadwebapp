'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { 
  Card, 
  CardBody, 
  Button, 
  Input, 
  Select, 
  SelectItem, 
  Textarea,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Pagination,
  Spinner
} from "@heroui/react"
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  DocumentIcon,
  PlayIcon,
  LinkIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface Content {
  _id: string
  unit: string
  chapter: string
  topic: string
  concept: string
  contentType: string
  instructionType: string
  level: string
  duration: number
  videoLink?: string
  description: string
  sequenceNo: number
  docCategory: string
  noOfProblems?: number
  createdAt: string
  isActive: boolean
  createdBy?: string
  isPublicAccess?: boolean
}

interface ContentFormData {
  unit: string
  chapter: string
  topic: string
  concept: string
  contentType: string
  instructionType: string
  level: string
  duration: number
  videoLink: string
  description: string
  sequenceNo: number
  docCategory: string
  noOfProblems: number | undefined
  isPublicAccess: boolean
}

const initialFormData: ContentFormData = {
  unit: '',
  chapter: '',
  topic: '',
  concept: '',
  contentType: 'video',
  instructionType: 'conceptDiscussion',
  level: 'Beginner',
  duration: 30,
  videoLink: '',
  description: '',
  sequenceNo: 1,
  docCategory: 'Learning',
  noOfProblems: undefined,
  isPublicAccess: false
}

export default function AdminContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<ContentFormData>(initialFormData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    unit: 'all',
    contentType: 'all',
    instructionType: 'all',
    level: 'all'
  })



  const fetchContent = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== 'all') {
          params.append(key, value)
        }
      })
      
      const response = await fetch(`/api/content?${params}`)
      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user?.role !== 'admin' && session.user?.role !== 'superadmin') {
      router.push('/dashboard')
      return
    }
    
    fetchContent()
  }, [session, status, router, fetchContent])

  const validateForm = () => {
    const errors: string[] = []
    
    // Check required fields
    if (!formData.unit) errors.push('Unit is required')
    if (!formData.chapter) errors.push('Chapter is required')
    if (!formData.topic) errors.push('Topic is required')
    if (!formData.concept) errors.push('Concept is required')
    if (!formData.description || formData.description.length < 10) {
      errors.push('Description must be at least 10 characters long')
    }
    if (formData.description.length > 2000) {
      errors.push('Description must be less than 2000 characters')
    }
    if (formData.sequenceNo < 1) errors.push('Sequence number must be positive')
    
    // Check category-specific requirements
    if (formData.docCategory === 'Learning' && !formData.videoLink) {
      errors.push('Learning resource URL is required for Learning category')
    }
    if ((formData.docCategory === 'MockTest' || formData.docCategory === 'PracticeSet') && !formData.noOfProblems) {
      errors.push('Number of problems is required for MockTest and PracticeSet')
    }
    
    // Validate URL format if provided
    if (formData.videoLink) {
      const urlRegex = /^https?:\/\/(www\.)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i
      if (!urlRegex.test(formData.videoLink)) {
        errors.push('Please enter a valid URL')
      }
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n\n' + validationErrors.join('\n'))
      return
    }
    
    setSubmitting(true)

    try {
      const url = editingId ? `/api/content/${editingId}` : '/api/content'
      const method = editingId ? 'PUT' : 'POST'
      
      // Create an AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (response.ok) {
        fetchContent()
        onFormClose()
        resetForm()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error: unknown) {
      console.error('Failed to save content:', error)
      if (error instanceof Error && error.name === 'AbortError') {
        alert('Request timed out. Please check your internet connection and try again.')
      } else {
        alert('Failed to save content. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item: Content) => {
    setFormData({
      unit: item.unit,
      chapter: item.chapter,
      topic: item.topic,
      concept: item.concept,
      contentType: item.contentType,
      instructionType: item.instructionType,
      level: item.level,
      duration: item.duration,
      videoLink: item.videoLink || '',
      description: item.description,
      sequenceNo: item.sequenceNo,
      docCategory: item.docCategory,
      noOfProblems: item.noOfProblems,
      isPublicAccess: item.isPublicAccess || false
    })
    setEditingId(item._id)
    onFormOpen()
  }

  const handleDelete = async () => {
    if (!deletingId) return
    
    try {
      const response = await fetch(`/api/content/${deletingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchContent()
        onDeleteClose()
        setDeletingId(null)
      } else {
        alert('Failed to delete content')
      }
    } catch (error) {
      console.error('Failed to delete content:', error)
      alert('Failed to delete content')
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setEditingId(null)
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayIcon className="h-4 w-4" />
      case 'pdf': return <DocumentIcon className="h-4 w-4" />
      case 'link': return <LinkIcon className="h-4 w-4" />
      default: return <DocumentIcon className="h-4 w-4" />
    }
  }

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'primary'
      case 'pdf': return 'danger'
      case 'link': return 'success'
      case 'testpaperLink': return 'warning'
      default: return 'default'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading content management...</p>
        </div>
      </div>
    )
  }

  if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'superadmin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
            <p className="mt-2 text-gray-600">
              Manage educational content for the Olympiad platform
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              color="primary"
              startContent={<PlusIcon className="h-4 w-4" />}
              onPress={() => {
                resetForm()
                onFormOpen()
              }}
            >
              Add New Content
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Filter by Unit"
                selectedKeys={[filters.unit]}
                onSelectionChange={(keys) => setFilters(prev => ({ ...prev, unit: Array.from(keys)[0] as string }))}
              >
                <SelectItem key="all">All Units</SelectItem>
                <SelectItem key="Algebra">Algebra</SelectItem>
                <SelectItem key="Geometry">Geometry</SelectItem>
                <SelectItem key="Number Theory">Number Theory</SelectItem>
                <SelectItem key="Combinatorics">Combinatorics</SelectItem>
                <SelectItem key="Functional Equations">Functional Equations</SelectItem>
                <SelectItem key="Inequalities">Inequalities</SelectItem>
                <SelectItem key="Advanced Math">Advanced Math</SelectItem>
                <SelectItem key="Calculus">Calculus</SelectItem>
                <SelectItem key="Other">Other</SelectItem>
              </Select>
              
              <Select
                label="Filter by Content Type"
                selectedKeys={[filters.contentType]}
                onSelectionChange={(keys) => setFilters(prev => ({ ...prev, contentType: Array.from(keys)[0] as string }))}
              >
                <SelectItem key="all">All Types</SelectItem>
                <SelectItem key="video">video</SelectItem>
                <SelectItem key="pdf">pdf</SelectItem>
                <SelectItem key="link">link</SelectItem>
                <SelectItem key="testpaperLink">testpaperLink</SelectItem>
              </Select>
              
              <Select
                label="Filter by Instruction Type"
                selectedKeys={[filters.instructionType]}
                onSelectionChange={(keys) => setFilters(prev => ({ ...prev, instructionType: Array.from(keys)[0] as string }))}
              >
                <SelectItem key="all">All Instruction Types</SelectItem>
                <SelectItem key="conceptDiscussion">Concept Discussion</SelectItem>
                <SelectItem key="problemDiscussion">Problem Discussion</SelectItem>
              </Select>
              
              <Select
                label="Filter by Level"
                selectedKeys={[filters.level]}
                onSelectionChange={(keys) => setFilters(prev => ({ ...prev, level: Array.from(keys)[0] as string }))}
              >
                <SelectItem key="all">All Levels</SelectItem>
                <SelectItem key="Pre-requisite">Pre-requisite</SelectItem>
                <SelectItem key="Beginner">Beginner</SelectItem>
                <SelectItem key="Intermediate">Intermediate</SelectItem>
                <SelectItem key="Advanced">Advanced</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Content Table */}
        <Card>
          <CardBody className="p-0">
            <Table 
              aria-label="Content management table"
              isHeaderSticky
              classNames={{
                wrapper: "max-h-[600px]",
              }}
            >
              <TableHeader>
                <TableColumn>CONTENT</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>CATEGORY</TableColumn>
                <TableColumn>LEVEL</TableColumn>
                <TableColumn>SEQUENCE</TableColumn>
                <TableColumn>UNIT</TableColumn>
                <TableColumn>DURATION</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No content found">
                {content.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{item.concept}</p>
                        <p className="text-sm text-gray-500">{item.chapter} • {item.topic}</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">{item.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Chip
                          size="sm"
                          color={getContentTypeColor(item.contentType)}
                          variant="flat"
                          startContent={getContentTypeIcon(item.contentType)}
                        >
                          {item.contentType}
                        </Chip>
                        <Chip
                          size="sm"
                          color={item.instructionType === 'conceptDiscussion' ? 'primary' : 'secondary'}
                          variant="dot"
                        >
                          {item.instructionType === 'conceptDiscussion' ? 'Concept' : 'Problem'}
                        </Chip>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Chip
                          size="sm"
                          color={item.docCategory === 'Learning' ? 'primary' : item.docCategory === 'MockTest' ? 'warning' : 'success'}
                          variant="flat"
                        >
                          {item.docCategory}
                        </Chip>
                        {item.noOfProblems && (
                          <span className="text-xs text-gray-500">{item.noOfProblems} problems</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={
                          item.level === 'Pre-requisite' ? 'secondary' : 
                          item.level === 'Beginner' ? 'success' : 
                          item.level === 'Intermediate' ? 'warning' : 
                          'danger'
                        }
                        variant="flat"
                      >
                        {item.level}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">#{item.sequenceNo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge color="primary" variant="flat">
                        {item.unit}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatDuration(item.duration)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Chip
                          size="sm"
                          color={item.isActive ? 'success' : 'danger'}
                          variant="flat"
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Chip>
                        {item.isPublicAccess && (
                          <Chip
                            size="sm"
                            color="success"
                            variant="dot"
                          >
                            Public
                          </Chip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.videoLink && (
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={() => window.open(item.videoLink, '_blank')}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onPress={() => handleEdit(item)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          isIconOnly
                          onPress={() => {
                            setDeletingId(item._id)
                            onDeleteOpen()
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              total={totalPages}
              page={page}
              onChange={setPage}
              showControls
            />
          </div>
        )}

        {/* Add/Edit Content Modal */}
        <Modal 
          isOpen={isFormOpen} 
          onOpenChange={onFormClose}
          size="2xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            {(onClose) => (
              <form onSubmit={handleSubmit}>
                <ModalHeader>
                  {editingId ? 'Edit Content' : 'Add New Content'}
                </ModalHeader>
                <ModalBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Unit"
                      isRequired
                      selectedKeys={formData.unit ? [formData.unit] : []}
                      onSelectionChange={(keys) => setFormData(prev => ({ ...prev, unit: Array.from(keys)[0] as string }))}
                    >
                      <SelectItem key="Algebra">Algebra</SelectItem>
                      <SelectItem key="Geometry">Geometry</SelectItem>
                      <SelectItem key="Number Theory">Number Theory</SelectItem>
                      <SelectItem key="Combinatorics">Combinatorics</SelectItem>
                      <SelectItem key="Functional Equations">Functional Equations</SelectItem>
                      <SelectItem key="Inequalities">Inequalities</SelectItem>
                      <SelectItem key="Advanced Math">Advanced Math</SelectItem>
                      <SelectItem key="Calculus">Calculus</SelectItem>
                      <SelectItem key="Other">Other</SelectItem>
                    </Select>
                    
                    <Input
                      label="Chapter"
                      isRequired
                      value={formData.chapter}
                      onChange={(e) => setFormData(prev => ({ ...prev, chapter: e.target.value }))}
                    />
                    
                    <Input
                      label="Topic"
                      isRequired
                      value={formData.topic}
                      onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    />
                    
                    <Input
                      label="Concept"
                      isRequired
                      value={formData.concept}
                      onChange={(e) => setFormData(prev => ({ ...prev, concept: e.target.value }))}
                    />
                    
                    <Select
                      label="Content Type"
                      isRequired
                      selectedKeys={formData.contentType ? [formData.contentType] : []}
                      onSelectionChange={(keys) => setFormData(prev => ({ ...prev, contentType: Array.from(keys)[0] as string }))}
                    >
                      <SelectItem key="video">video</SelectItem>
                      <SelectItem key="pdf">pdf</SelectItem>
                      <SelectItem key="link">link</SelectItem>
                      <SelectItem key="testpaperLink">testpaperLink</SelectItem>
                    </Select>
                    
                    <Select
                      label="Instruction Type"
                      isRequired
                      selectedKeys={formData.instructionType ? [formData.instructionType] : []}
                      onSelectionChange={(keys) => setFormData(prev => ({ ...prev, instructionType: Array.from(keys)[0] as string }))}
                    >
                      <SelectItem key="conceptDiscussion">Concept Discussion</SelectItem>
                      <SelectItem key="problemDiscussion">Problem Discussion</SelectItem>
                    </Select>
                    
                    <Select
                      label="Level"
                      isRequired
                      selectedKeys={formData.level ? [formData.level] : []}
                      onSelectionChange={(keys) => setFormData(prev => ({ ...prev, level: Array.from(keys)[0] as string }))}
                    >
                      <SelectItem key="Pre-requisite">Pre-requisite</SelectItem>
                      <SelectItem key="Beginner">Beginner</SelectItem>
                      <SelectItem key="Intermediate">Intermediate</SelectItem>
                      <SelectItem key="Advanced">Advanced</SelectItem>
                    </Select>
                    
                    <Input
                      label="Duration (minutes)"
                      type="number"
                      min="1"
                      max="1440"
                      isRequired
                      value={formData.duration.toString()}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                    />
                    
                    <Input
                      label={formData.docCategory === 'Learning' ? 'Learning Resource URL' : 'Resource URL'}
                      type="url"
                      placeholder="https://..."
                      value={formData.videoLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, videoLink: e.target.value }))}
                      description={
                        formData.docCategory === 'Learning' 
                          ? 'YouTube, Vimeo, Google Drive, PDF, or other learning resource URL' 
                          : formData.docCategory === 'MockTest'
                            ? 'Direct link to mock test PDF or online test'
                            : formData.docCategory === 'PracticeSet'
                              ? 'Direct link to practice set PDF or online problems'
                              : 'Direct link to resource'
                      }
                      isRequired={formData.docCategory === 'Learning'}
                      errorMessage={
                        formData.videoLink && formData.videoLink.length > 0 && 
                        !/^https?:\/\/(www\.)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i.test(formData.videoLink)
                          ? 'Please enter a valid URL (must start with http:// or https://)'
                          : undefined
                      }
                      isInvalid={
                        Boolean(formData.videoLink && formData.videoLink.length > 0 && 
                        !/^https?:\/\/(www\.)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i.test(formData.videoLink))
                      }
                    />
                    
                    <Input
                      label="Sequence Number"
                      type="number"
                      min="1"
                      isRequired
                      value={formData.sequenceNo.toString()}
                      onChange={(e) => setFormData(prev => ({ ...prev, sequenceNo: parseInt(e.target.value) || 1 }))}
                      description="Order in which students should access this content"
                    />
                    
                    <Select
                      label="Document Category"
                      isRequired
                      selectedKeys={formData.docCategory ? [formData.docCategory] : []}
                      onSelectionChange={(keys) => {
                        const category = Array.from(keys)[0] as string
                        setFormData(prev => ({ 
                          ...prev, 
                          docCategory: category,
                          // Auto-adjust contentType based on category
                          contentType: category === 'Learning' ? 'video' : 
                                     category === 'MockTest' ? 'testpaperLink' : 
                                     category === 'PracticeSet' ? 'testpaperLink' : prev.contentType,
                          noOfProblems: category === 'Learning' ? undefined : prev.noOfProblems
                        }))
                      }}
                    >
                      <SelectItem key="Learning">Learning</SelectItem>
                      <SelectItem key="MockTest">MockTest</SelectItem>
                      <SelectItem key="PracticeSet">PracticeSet</SelectItem>
                    </Select>
                    
                    {(formData.docCategory === 'MockTest' || formData.docCategory === 'PracticeSet') && (
                      <Input
                        label="Number of Problems"
                        type="number"
                        min="1"
                        max="500"
                        isRequired
                        value={formData.noOfProblems?.toString() || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, noOfProblems: parseInt(e.target.value) || undefined }))}
                        description="Total number of problems in this test/practice set"
                      />
                    )}
                    
                    <Select
                      label="Public Access"
                      selectedKeys={formData.isPublicAccess ? ['true'] : ['false']}
                      onSelectionChange={(keys) => {
                        const isPublic = Array.from(keys)[0] === 'true'
                        setFormData(prev => ({ ...prev, isPublicAccess: isPublic }))
                      }}
                      description={
                        formData.level === 'Pre-requisite' 
                          ? 'Public access allows non-logged-in users to view this content on the prerequisites page'
                          : 'Public access makes this content available to non-logged-in users (currently only prerequisite content appears on public pages)'
                      }
                    >
                      <SelectItem key="false">Private (Subscription Required)</SelectItem>
                      <SelectItem key="true">Public (Free Access)</SelectItem>
                    </Select>
                  </div>
                  
                  <Textarea
                    label="Description"
                    isRequired
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    description={`Detailed description of the content and what students will learn (${formData.description.length}/10 minimum, 2000 maximum)`}
                    errorMessage={
                      formData.description.length > 0 && formData.description.length < 10 
                        ? `Description must be at least 10 characters long (currently ${formData.description.length})` 
                        : formData.description.length > 2000 
                          ? `Description must be less than 2000 characters (currently ${formData.description.length})`
                          : undefined
                    }
                    isInvalid={
                      Boolean((formData.description.length > 0 && formData.description.length < 10) || 
                      formData.description.length > 2000)
                    }
                  />
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    color="primary" 
                    type="submit"
                    isLoading={submitting}
                    isDisabled={
                      submitting || 
                      validateForm().length > 0 ||
                      !formData.unit ||
                      !formData.chapter ||
                      !formData.topic ||
                      !formData.concept ||
                      formData.description.length < 10
                    }
                  >
                    {editingId ? 'Update Content' : 'Add Content'}
                  </Button>
                </ModalFooter>
              </form>
            )}
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteClose}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Confirm Delete</ModalHeader>
                <ModalBody>
                  <p>Are you sure you want to delete this content? This action cannot be undone.</p>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="danger" onPress={handleDelete}>
                    Delete
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  )
}
