'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardBody, Spinner, Button } from '@heroui/react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

function PaymentConfirmContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const subscriptionId = searchParams.get('subscription_id')
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')

    if (status === 'success') {
      setPaymentStatus('success')
      setMessage('Your subscription has been activated successfully!')
    } else if (status === 'failed') {
      setPaymentStatus('failed')
      setMessage('Payment failed. Please try again.')
    } else if (subscriptionId) {
      // Check subscription status
      checkSubscriptionStatus(subscriptionId)
    } else {
      setPaymentStatus('failed')
      setMessage('Invalid payment details')
    }
  }, [searchParams])

  const checkSubscriptionStatus = async (subscriptionId: string) => {
    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        if (data.subscriptionStatus === 'active') {
          setPaymentStatus('success')
          setMessage('Your subscription has been activated successfully!')
        } else {
          setPaymentStatus('failed')
          setMessage('Subscription activation failed. Please contact support.')
        }
      } else {
        throw new Error('Failed to check subscription status')
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
      setPaymentStatus('failed')
      setMessage('Unable to verify payment status. Please contact support.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardBody className="text-center p-8">
          {paymentStatus === 'loading' && (
            <div>
              <Spinner size="lg" className="mb-4" />
              <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
              <p className="text-gray-600">Please wait while we confirm your payment...</p>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div>
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Button
                  color="primary"
                  className="w-full"
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="bordered"
                  className="w-full"
                  onClick={() => router.push('/training')}
                >
                  Start Learning
                </Button>
              </div>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div>
              <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Button
                  color="primary"
                  className="w-full"
                  onClick={() => router.push('/pricing')}
                >
                  Try Again
                </Button>
                <Button
                  variant="bordered"
                  className="w-full"
                  onClick={() => router.push('/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

const PaymentConfirmPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center p-8">
            <Spinner size="lg" className="mb-4" />
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            <p className="text-gray-600">Please wait while we process your request...</p>
          </CardBody>
        </Card>
      </div>
    }>
      <PaymentConfirmContent />
    </Suspense>
  )
}

export default PaymentConfirmPage
