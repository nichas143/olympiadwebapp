'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, Button, Chip, Spinner } from '@heroui/react'
import { CheckIcon } from '@heroicons/react/24/solid'
import { SUBSCRIPTION_PLANS, isTestingMode, isFreeAccess } from '@/lib/razorpay'

interface SubscriptionStatus {
  subscriptionStatus: string
  trialInfo?: {
    daysLeft: number
    endDate: string
    isExpired: boolean
  }
  subscriptionInfo?: {
    plan: string
    endDate: string
    daysLeft: number
    amount: number
  }
  hasAccess: boolean
}

const PricingPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStartingTrial, setIsStartingTrial] = useState(false)
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSubscriptionStatus()
    } else if (status === 'unauthenticated') {
      setIsLoading(false)
    }
  }, [status])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionStatus(data)
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startTrial = async () => {
    setIsStartingTrial(true)
    try {
      const response = await fetch('/api/subscription/trial', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Trial started! You have ${data.daysLeft} days of free access.`)
        fetchSubscriptionStatus()
        router.push('/dashboard')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to start trial')
      }
    } catch (error) {
      console.error('Error starting trial:', error)
      alert('Failed to start trial')
    } finally {
      setIsStartingTrial(false)
    }
  }

  const createSubscription = async (planType: string) => {
    setIsCreatingSubscription(true)
    try {
      // In free access mode, directly activate subscription without payment
      if (isFree) {
        const response = await fetch('/api/subscription/activate-free', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planType }),
        })

        if (response.ok) {
          alert('Free subscription activated! You now have access to all content.')
          fetchSubscriptionStatus()
          router.push('/dashboard')
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to activate free subscription')
        }
        setIsCreatingSubscription(false)
        return
      }

      // Normal payment flow for non-free mode
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Initialize Razorpay checkout
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: 'Olympiad Pi Math',
          description: data.planDetails.description,
          order_id: data.orderId,
          prefill: {
            name: data.user.name,
            email: data.user.email,
          },
          theme: {
            color: '#3B82F6'
          },
          handler: async function (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) {
            // Verify payment
            try {
              const verifyResponse = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              })

              if (verifyResponse.ok) {
                alert('Payment successful! Your subscription is now active.')
                fetchSubscriptionStatus()
                router.push('/dashboard')
              } else {
                alert('Payment verification failed. Please contact support.')
              }
            } catch (error) {
              console.error('Payment verification error:', error)
              alert('Payment verification failed. Please contact support.')
            } finally {
              setIsCreatingSubscription(false)
            }
          },
          modal: {
            ondismiss: async function() {
              // User cancelled the payment - reset their status
              try {
                await fetch('/api/payment/cancel', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  }
                })
                // Refresh subscription status
                fetchSubscriptionStatus()
              } catch (error) {
                console.error('Error cancelling payment:', error)
              } finally {
                setIsCreatingSubscription(false)
              }
            }
          }
        }

        // Load Razorpay script and open checkout
        const loadRazorpayScript = () => {
          return new Promise((resolve) => {
            // Check if script is already loaded
            if ((window as typeof window & { Razorpay?: unknown }).Razorpay) {
              resolve(true)
              return
            }

            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
          })
        }

        loadRazorpayScript().then((loaded) => {
          if (loaded) {
            const rzp = new (window as typeof window & { Razorpay: new(options: unknown) => { open: () => void } }).Razorpay(options)
            rzp.open()
          } else {
            alert('Failed to load payment gateway. Please try again.')
            setIsCreatingSubscription(false)
          }
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create payment order')
        setIsCreatingSubscription(false)
      }
    } catch (error) {
      console.error('Error creating payment order:', error)
      alert('Failed to create payment order')
      setIsCreatingSubscription(false)
    }
  }

  const isTesting = isTestingMode()
  const isFree = isFreeAccess()
  const monthlyPlan = SUBSCRIPTION_PLANS.monthly
  const yearlyPlan = SUBSCRIPTION_PLANS.yearly

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: isFree ? 0 : monthlyPlan.amount / 100, // Free in free access mode
      originalPrice: isFree ? 300 : (isTesting ? 300 : 399), // Show future pricing
      duration: 'month',
      description: isFree ? 'Monthly access (Currently FREE!)' : (isTesting ? 'Monthly access (TEST MODE: ₹5)' : 'Monthly access to all Olympiad training materials'),
      features: [
        'All video lectures (100+ hours)',
        'Comprehensive study materials',
        'Practice problems with solutions',
        'Monthly mock tests',
        'Progress tracking',
        'Priority doubt resolution',
        'Download PDFs for offline study',
        'Monthly billing',
        'Cancel anytime'
      ],
      popular: false,
      savings: undefined,
      note: undefined
    },
    {
      id: 'yearly',
      name: 'Yearly Plan',
      price: isFree ? 0 : yearlyPlan.amount / 100, // Free in free access mode
      originalPrice: isFree ? 3000 : (isTesting ? 60 : 3600), // Show future pricing
      duration: 'year',
      description: isFree ? 'Yearly access (Currently FREE!)' : (isTesting ? 'Yearly access (TEST MODE: ₹50)' : 'Yearly access to all Olympiad training materials'),
      features: [
        'All video lectures (100+ hours)',
        'Comprehensive study materials',
        'Practice problems with solutions',
        'Monthly mock tests',
        'Progress tracking',
        'Priority doubt resolution',
        'Download PDFs for offline study',
        'Yearly billing',
        isTesting ? 'Save ₹10 compared to monthly' : 'Save ₹600 compared to monthly',
        'Best value for serious students'
      ],
      popular: true,
      savings: isTesting ? 'SAVE ₹10' : 'SAVE ₹600',
      note: 'Most Popular'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {isFree && (
            <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg mb-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center">
                <span className="text-lg">🎉</span>
                <span className="ml-2 font-semibold">FREE ACCESS ENABLED!</span>
              </div>
              <p className="text-sm mt-1">All content is currently free • Pricing will be ₹300/month and ₹3000/year later</p>
            </div>
          )}
          {isTesting && !isFree && (
            <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-3 rounded-lg mb-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center">
                <span className="text-lg">🧪</span>
                <span className="ml-2 font-semibold">TEST MODE: Monthly ₹5 or Yearly ₹50!</span>
              </div>
              <p className="text-sm mt-1">Using Razorpay test mode • Safe testing • No real charges</p>
            </div>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Learning Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get unlimited access to our comprehensive Olympiad training program
          </p>
        </div>

        {/* Current Subscription Status */}
        {session && subscriptionStatus && (
          <div className="mb-8">
            <Card className="max-w-2xl mx-auto">
              <CardBody className="text-center p-6">
                {subscriptionStatus.subscriptionStatus === 'trial' && subscriptionStatus.trialInfo && (
                  <div>
                    <Chip color="primary" variant="flat" className="mb-2">
                      Free Trial Active
                    </Chip>
                    <p className="text-lg font-semibold text-green-600">
                      {subscriptionStatus.trialInfo.daysLeft} days remaining in your trial
                    </p>
                    <p className="text-gray-600">
                      Trial ends on {new Date(subscriptionStatus.trialInfo.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                {subscriptionStatus.subscriptionStatus === 'active' && subscriptionStatus.subscriptionInfo && (
                  <div>
                    <Chip color="success" variant="flat" className="mb-2">
                      Subscription Active
                    </Chip>
                    <p className="text-lg font-semibold text-green-600">
                      {subscriptionStatus.subscriptionInfo.plan === 'annual' ? 'Annual Plan' : 'Student Annual Plan'}
                    </p>
                    <p className="text-gray-600">
                      Valid until {new Date(subscriptionStatus.subscriptionInfo.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {subscriptionStatus.subscriptionStatus === 'none' && (
                  <div>
                    <Chip color="default" variant="flat" className="mb-2">
                      No Active Subscription
                    </Chip>
                    <p className="text-gray-600">
                      Start your learning journey today!
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* Free Trial Section */}
        {session && subscriptionStatus?.subscriptionStatus === 'none' && !subscriptionStatus.trialInfo && (
          <div className="mb-12">
            <Card className="max-w-2xl mx-auto border-2 border-green-200 bg-green-50">
              <CardBody className="text-center p-8">
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  Start Your 14-Day Free Trial
                </h3>
                <p className="text-green-700 mb-4">
                  Experience our complete Olympiad training program at no cost
                </p>
                <Button 
                  color="success" 
                  size="lg" 
                  onClick={startTrial}
                  isLoading={isStartingTrial}
                  className="font-semibold"
                >
                  Start Free Trial
                </Button>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-2 border-indigo-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Chip color="primary" variant="solid" className="font-semibold">
                    Most Popular
                  </Chip>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </div>
              </CardHeader>
              
              <CardBody className="pt-2">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-indigo-600">₹{plan.price.toLocaleString()}</span>
                    <span className="text-lg text-gray-500 line-through">₹{plan.originalPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-gray-600">per {plan.duration}</p>
                  <Chip color="success" variant="flat" size="sm" className="mt-1">
                    {plan.savings}
                  </Chip>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.note && (
                  <p className="text-sm text-amber-600 mb-4 font-medium">
                    ⚠️ {plan.note}
                  </p>
                )}

                {session ? (
                  subscriptionStatus?.hasAccess ? (
                    <Button
                      color="default"
                      variant="flat"
                      className="w-full"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      color={plan.popular ? "primary" : "default"}
                      variant={plan.popular ? "solid" : "bordered"}
                      className="w-full font-semibold"
                      size="lg"
                      onClick={() => createSubscription(plan.id)}
                      isLoading={isCreatingSubscription}
                    >
                      Subscribe Now
                    </Button>
                  )
                ) : (
                  <Button
                    color="primary"
                    className="w-full font-semibold"
                    size="lg"
                    onClick={() => router.push('/auth/signin')}
                  >
                    Sign In to Subscribe
                  </Button>
                )}
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What You Get With Every Plan
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Content</h3>
              <p className="text-gray-600">
                100+ hours of video lectures, study materials, and practice problems covering all Olympiad topics
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Learning</h3>
              <p className="text-gray-600">
                Track your progress, identify weak areas, and get personalized recommendations
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600">
                Get your doubts resolved by expert mentors and join our supportive community
              </p>
            </div>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              30-Day Money Back Guarantee
            </h3>
            <p className="text-gray-600">
              Not satisfied with our content? Get a full refund within 30 days of purchase. 
              No questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingPage
