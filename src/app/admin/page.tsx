'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Button, Card, CardBody, CardHeader, Tab, Tabs, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, useDisclosure, Chip, Pagination } from '@heroui/react'

interface User {
  _id: string
  name: string
  email: string
  role: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  approvedAt?: string
  approvedBy?: string
  subscriptionStatus: 'none' | 'trial' | 'pending' | 'active' | 'expired' | 'cancelled'
  subscriptionPlan?: 'annual' | 'student_annual' | 'monthly_test' | 'monthly' | 'yearly'
  subscriptionEndDate?: string
  trialEndDate?: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('pending')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [statusCounts, setStatusCounts] = useState({ pending: 0, approved: 0, rejected: 0 })
  
  const { isOpen: isRejectModalOpen, onOpen: onRejectModalOpen, onClose: onRejectModalClose } = useDisclosure()

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        status: selectedStatus,
        page: currentPage.toString(),
        limit: '10'
      })
      
      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setPagination(data.pagination)
        setStatusCounts(data.statusCounts || { pending: 0, approved: 0, rejected: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedStatus, currentPage])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      router.push('/auth/signin')
      return
    }
    
    fetchUsers()
  }, [session, status, router, fetchUsers])

  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST'
      })
      
      if (response.ok) {
        fetchUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to approve user:', error)
    }
  }

  const handleReject = async () => {
    if (!selectedUser) return
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      })
      
      if (response.ok) {
        fetchUsers() // Refresh the list
        onRejectModalClose()
        setRejectionReason('')
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('Failed to reject user:', error)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchUsers() // Refresh the list
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user')
    }
  }

  const openRejectModal = (user: User) => {
    setSelectedUser(user)
    onRejectModalOpen()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'rejected': return 'danger'
      default: return 'default'
    }
  }

  const getSubscriptionDisplay = (user: User) => {
    if (!user.subscriptionStatus || user.subscriptionStatus === 'none' || user.subscriptionStatus === 'expired') {
      return 'Not Subscribed'
    }
    
    const planMap: Record<string, string> = {
      'monthly': 'Monthly',
      'yearly': 'Yearly',
      'annual': 'Annual',
      'student_annual': 'Student Annual',
      'monthly_test': 'Monthly Test'
    }
    
    const plan = user.subscriptionPlan ? planMap[user.subscriptionPlan] || user.subscriptionPlan : 'Unknown'
    const status = user.subscriptionStatus.charAt(0).toUpperCase() + user.subscriptionStatus.slice(1)
    
    return `${plan} (${status})`
  }

  const canDeleteUser = (user: User) => {
    return user.subscriptionStatus === 'none' || user.subscriptionStatus === 'expired' || user.subscriptionStatus === 'cancelled'
  }

  const getRemainingDays = (endDate: string | undefined): string => {
    if (!endDate) return 'N/A'
    
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Expired'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day'
    return `${diffDays} days`
  }

  const getDaysDisplay = (user: User): string => {
    if (!user.subscriptionStatus) {
      return 'N/A'
    }
    
    if (user.subscriptionStatus === 'trial' && user.trialEndDate) {
      return getRemainingDays(user.trialEndDate)
    }
    
    if (user.subscriptionStatus === 'active' && user.subscriptionEndDate) {
      return getRemainingDays(user.subscriptionEndDate)
    }
    
    return 'N/A'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">
            {session.user.role === 'superadmin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}
          </h1>
          <p className="mt-2 text-gray-600">
            {session.user.role === 'superadmin' 
              ? 'Manage user registrations, approvals, and admin accounts'
              : 'Manage user registrations and approvals'
            }
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Button
              color="primary"
              variant="flat"
              onPress={() => router.push('/admin/content')}
            >
              📚 Manage Content
            </Button>
            {session.user.role === 'superadmin' && (
              <Button
                color="secondary"
                variant="flat"
                onPress={() => window.open('/admin/manage-admins', '_blank')}
              >
                👥 Manage Admin Accounts
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <h2 className="text-xl font-semibold">User Management</h2>
              <div className="text-sm text-gray-500">
                Total: {pagination?.total || 0} users
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
              <Tab key="pending" title={
                <div className="flex items-center space-x-2">
                  <span>Pending</span>
                  <Chip size="sm" color="warning" variant="flat">
                    {statusCounts.pending}
                  </Chip>
                </div>
              } />
              <Tab key="approved" title={
                <div className="flex items-center space-x-2">
                  <span>Approved</span>
                  <Chip size="sm" color="success" variant="flat">
                    {statusCounts.approved}
                  </Chip>
                </div>
              } />
              <Tab key="rejected" title={
                <div className="flex items-center space-x-2">
                  <span>Rejected</span>
                  <Chip size="sm" color="danger" variant="flat">
                    {statusCounts.rejected}
                  </Chip>
                </div>
              } />
            </Tabs>

            {selectedStatus === 'approved' ? (
              <Table aria-label="Users table">
                <TableHeader>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>EMAIL</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>SUBSCRIPTION</TableColumn>
                  <TableColumn>DAYS LEFT</TableColumn>
                  <TableColumn>REGISTERED</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No users found">
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.role}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          color={getStatusColor(user.status)} 
                          variant="flat"
                          size="sm"
                        >
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getSubscriptionDisplay(user)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getDaysDisplay(user)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(user.createdAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {user.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                color="success"
                                variant="flat"
                                onPress={() => handleApprove(user._id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                onPress={() => openRejectModal(user)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {user.status === 'approved' && user.approvedAt && (
                            <div className="text-xs text-gray-500">
                              Approved on {new Date(user.approvedAt).toLocaleDateString()}
                            </div>
                          )}
                          {canDeleteUser(user) && (
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              onPress={() => handleDelete(user._id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table aria-label="Users table">
                <TableHeader>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>EMAIL</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>DAYS LEFT</TableColumn>
                  <TableColumn>REGISTERED</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No users found">
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.role}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          color={getStatusColor(user.status)} 
                          variant="flat"
                          size="sm"
                        >
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getDaysDisplay(user)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(user.createdAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {user.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                color="success"
                                variant="flat"
                                onPress={() => handleApprove(user._id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                onPress={() => openRejectModal(user)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {user.status === 'approved' && user.approvedAt && (
                            <div className="text-xs text-gray-500">
                              Approved on {new Date(user.approvedAt).toLocaleDateString()}
                            </div>
                          )}
                          {canDeleteUser(user) && (
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              onPress={() => handleDelete(user._id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

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

        <Modal isOpen={isRejectModalOpen} onClose={onRejectModalClose}>
          <ModalContent>
            <ModalHeader>Reject User Application</ModalHeader>
            <ModalBody>
              <p className="mb-4">
                Are you sure you want to reject <strong>{selectedUser?.name}</strong>&apos;s application?
              </p>
              <Textarea
                label="Rejection Reason (optional)"
                placeholder="Provide a reason for rejection..."
                value={rejectionReason}
                onValueChange={setRejectionReason}
                maxRows={4}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onRejectModalClose}>
                Cancel
              </Button>
              <Button color="danger" onPress={handleReject}>
                Reject User
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  )
}
