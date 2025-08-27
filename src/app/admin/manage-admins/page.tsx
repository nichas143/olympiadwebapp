'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Input, Select, SelectItem, useDisclosure, Chip } from '@heroui/react'

interface AdminUser {
  _id: string
  name: string
  email: string
  role: 'admin' | 'superadmin'
  status: string
  createdAt: string
  approvedAt?: string
}

export default function ManageAdminsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'superadmin') {
      router.push('/admin')
      return
    }
    
    fetchAdmins()
  }, [session, status, router])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/manage-admins')
      if (response.ok) {
        const data = await response.json()
        setAdmins(data.admins)
      }
    } catch (error) {
      console.error('Failed to fetch admin users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async () => {
    try {
      setMessage({ type: '', text: '' })
      
      const response = await fetch('/api/admin/manage-admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Admin user created successfully!' })
        fetchAdmins()
        setFormData({ name: '', email: '', password: '', role: 'admin' })
        setTimeout(() => {
          onCreateModalClose()
          setMessage({ type: '', text: '' })
        }, 1500)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create admin user' })
      }
    } catch (error) {
      console.error('Failed to create admin user:', error)
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    }
  }

  const handleDeleteAdmin = async (adminId: string, adminName: string) => {
    if (!confirm(`Are you sure you want to delete admin user "${adminName}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/manage-admins/${adminId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchAdmins()
      } else {
        const data = await response.json()
        alert(`Failed to delete admin: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to delete admin user:', error)
      alert('An error occurred while deleting the admin user.')
    }
  }

  const handleRoleChange = async (adminId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/manage-admins/${adminId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })
      
      if (response.ok) {
        fetchAdmins()
      } else {
        const data = await response.json()
        alert(`Failed to update role: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to update admin role:', error)
      alert('An error occurred while updating the role.')
    }
  }

  const getRoleColor = (role: string) => {
    return role === 'superadmin' ? 'danger' : 'primary'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin management...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600">You need superadmin privileges to access this page.</p>
            <Button className="mt-4" color="primary" onPress={() => router.push('/admin')}>
              Back to Admin Dashboard
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Admin Accounts</h1>
            <p className="mt-2 text-gray-600">Create and manage administrator accounts</p>
          </div>
          <div className="flex space-x-4">
            <Button
              color="primary"
              onPress={onCreateModalOpen}
            >
              Create New Admin
            </Button>
            <Button
              variant="light"
              onPress={() => router.push('/admin')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <h2 className="text-xl font-semibold">Administrator Accounts</h2>
              <div className="text-sm text-gray-500">
                Total: {admins.length} admin accounts
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Table aria-label="Admin users table">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>CREATED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No admin users found">
                {admins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{admin.name}</div>
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Chip 
                        color={getRoleColor(admin.role)} 
                        variant="flat"
                        size="sm"
                      >
                        {admin.role.charAt(0).toUpperCase() + admin.role.slice(1)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {admin._id !== session.user.id && (
                          <>
                            <Select
                              size="sm"
                              placeholder="Change Role"
                              selectedKeys={[admin.role]}
                              onSelectionChange={(keys) => {
                                const newRole = Array.from(keys)[0] as string
                                if (newRole && newRole !== admin.role) {
                                  handleRoleChange(admin._id, newRole)
                                }
                              }}
                              className="min-w-32"
                            >
                              <SelectItem key="admin">Admin</SelectItem>
                              <SelectItem key="superadmin">Super Admin</SelectItem>
                            </Select>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              onPress={() => handleDeleteAdmin(admin._id, admin.name)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                        {admin._id === session.user.id && (
                          <Chip size="sm" color="success" variant="flat">
                            You
                          </Chip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose} size="lg">
          <ModalContent>
            <ModalHeader>Create New Admin User</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="Enter admin's full name"
                  value={formData.name}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                  isRequired
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                  isRequired
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter secure password"
                  value={formData.password}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
                  isRequired
                  description="Minimum 8 characters"
                />
                <Select
                  label="Role"
                  placeholder="Select admin role"
                  selectedKeys={[formData.role]}
                  onSelectionChange={(keys) => {
                    const role = Array.from(keys)[0] as string
                    setFormData(prev => ({ ...prev, role }))
                  }}
                  isRequired
                >
                  <SelectItem key="admin">Admin</SelectItem>
                  <SelectItem key="superadmin">Super Admin</SelectItem>
                </Select>
              </div>

              {message.text && (
                <div className={`mt-4 p-3 rounded-md ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onCreateModalClose}>
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleCreateAdmin}
                isDisabled={!formData.name || !formData.email || !formData.password || !formData.role}
              >
                Create Admin
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  )
}
