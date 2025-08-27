'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  
  const { isOpen: isRejectModalOpen, onOpen: onRejectModalOpen, onClose: onRejectModalClose } = useDisclosure()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'admin') {
      router.push('/auth/signin')
      return
    }
    
    fetchUsers()
  }, [session, status, router, selectedStatus, currentPage])

  const fetchUsers = async () => {
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
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

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

  if (!session || session.user.role !== 'admin') {
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage user registrations and approvals</p>
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
                    {users.filter(u => u.status === 'pending').length}
                  </Chip>
                </div>
              } />
              <Tab key="approved" title={
                <div className="flex items-center space-x-2">
                  <span>Approved</span>
                  <Chip size="sm" color="success" variant="flat">
                    {users.filter(u => u.status === 'approved').length}
                  </Chip>
                </div>
              } />
              <Tab key="rejected" title={
                <div className="flex items-center space-x-2">
                  <span>Rejected</span>
                  <Chip size="sm" color="danger" variant="flat">
                    {users.filter(u => u.status === 'rejected').length}
                  </Chip>
                </div>
              } />
            </Tabs>

            <Table aria-label="Users table">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>STATUS</TableColumn>
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

        <Modal isOpen={isRejectModalOpen} onClose={onRejectModalClose}>
          <ModalContent>
            <ModalHeader>Reject User Application</ModalHeader>
            <ModalBody>
              <p className="mb-4">
                Are you sure you want to reject <strong>{selectedUser?.name}</strong>'s application?
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
