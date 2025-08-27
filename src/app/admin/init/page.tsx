'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, CardBody, CardHeader, Input, Divider } from '@heroui/react'

export default function AdminInitPage() {
  const router = useRouter()
  const [needsInit, setNeedsInit] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Super Admin (required)
    superAdminName: '',
    superAdminEmail: '',
    superAdminPassword: '',
    // Regular Admin (optional)
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    // Security
    initKey: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    checkInitStatus()
  }, [])

  const checkInitStatus = async () => {
    try {
      const response = await fetch('/api/admin/init')
      const data = await response.json()
      
      if (data.needsInitialization) {
        setNeedsInit(true)
      } else {
        setNeedsInit(false)
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error checking init status:', error)
      setMessage({ type: 'error', text: 'Failed to check initialization status' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/admin/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Admin accounts created successfully! You can now sign in.' 
        })
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create admin accounts' })
      }
    } catch (error) {
      console.error('Error creating admin accounts:', error)
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (needsInit === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking initialization status...</p>
        </div>
      </div>
    )
  }

  if (needsInit === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardBody className="text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Admin Already Initialized</h2>
            <p className="text-gray-600 mb-4">Admin accounts have already been created.</p>
            <Button color="primary" onPress={() => router.push('/auth/signin')}>
              Go to Sign In
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Initialize Admin Accounts</h1>
          <p className="mt-2 text-gray-600">
            Set up the initial admin accounts for the Math Olympiad platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Create Admin Accounts</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Super Admin Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Super Administrator (Required)
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Super Admin Name"
                    placeholder="Enter super admin full name"
                    value={formData.superAdminName}
                    onValueChange={(value) => handleInputChange('superAdminName', value)}
                    isRequired
                  />
                  <Input
                    label="Super Admin Email"
                    type="email"
                    placeholder="superadmin@example.com"
                    value={formData.superAdminEmail}
                    onValueChange={(value) => handleInputChange('superAdminEmail', value)}
                    isRequired
                  />
                  <Input
                    label="Super Admin Password"
                    type="password"
                    placeholder="Enter secure password"
                    value={formData.superAdminPassword}
                    onValueChange={(value) => handleInputChange('superAdminPassword', value)}
                    isRequired
                    description="Minimum 8 characters recommended"
                  />
                </div>
              </div>

              <Divider />

              {/* Regular Admin Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Regular Administrator (Optional)
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Admin Name"
                    placeholder="Enter admin full name"
                    value={formData.adminName}
                    onValueChange={(value) => handleInputChange('adminName', value)}
                  />
                  <Input
                    label="Admin Email"
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.adminEmail}
                    onValueChange={(value) => handleInputChange('adminEmail', value)}
                  />
                  <Input
                    label="Admin Password"
                    type="password"
                    placeholder="Enter secure password"
                    value={formData.adminPassword}
                    onValueChange={(value) => handleInputChange('adminPassword', value)}
                  />
                </div>
              </div>

              <Divider />

              {/* Security Key */}
              <div>
                <Input
                  label="Initialization Key"
                  type="password"
                  placeholder="Enter initialization key"
                  value={formData.initKey}
                  onValueChange={(value) => handleInputChange('initKey', value)}
                  isRequired
                  description="Contact system administrator for the initialization key"
                />
              </div>

              {/* Message Display */}
              {message.text && (
                <div className={`p-4 rounded-md ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full"
                isLoading={loading}
                isDisabled={!formData.superAdminName || !formData.superAdminEmail || !formData.superAdminPassword || !formData.initKey}
              >
                {loading ? 'Creating Admin Accounts...' : 'Initialize Admin Accounts'}
              </Button>
            </form>

            {/* Information Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• This page is only accessible during initial setup</li>
                <li>• Super Administrator has full system access</li>
                <li>• Regular Administrator can manage users but not other admins</li>
                <li>• Store credentials securely - they cannot be recovered</li>
                <li>• The initialization key should be kept confidential</li>
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
