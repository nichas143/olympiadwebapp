import Razorpay from 'razorpay'

// Lazy initialization function for Razorpay
function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  
  if (!keyId || !keySecret) {
    console.error('Razorpay credentials not found. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.')
    console.log('Current env check:', {
      keyId: keyId ? 'SET' : 'NOT SET',
      keySecret: keySecret ? 'SET' : 'NOT SET',
      nodeEnv: process.env.NODE_ENV
    })
    return null
  }
  
  try {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  } catch (error) {
    console.error('Failed to initialize Razorpay:', error)
    return null
  }
}

// Initialize Razorpay instance lazily
let razorpayInstance: Razorpay | null = null

function getRazorpay() {
  if (!razorpayInstance) {
    razorpayInstance = getRazorpayInstance()
  }
  return razorpayInstance
}

export interface SubscriptionPlan {
  id: string
  name: string
  amount: number
  currency: string
  period: 'yearly' | 'monthly' | 'weekly' | 'daily'
  interval: number
  description: string
}

// Environment-based pricing configuration
const IS_TESTING = process.env.NODE_ENV === 'development' || process.env.TESTING_MODE === 'true'

// Subscription plans configuration - Using your existing Razorpay plan
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  monthly_test: {
    id: 'plan_RBCUZm15JCEJxq', // Your existing Razorpay plan ID
    name: 'Monthly Plan',
    amount: 500, // ₹5 in paise
    currency: 'INR',
    period: 'monthly',
    interval: 1,
    description: 'Monthly access to all content - ₹5 per month'
  }
}

// Helper function to check if we're in testing mode
export const isTestingMode = () => IS_TESTING

// Create a customer in Razorpay
export async function createRazorpayCustomer(name: string, email: string, contact?: string) {
  const razorpay = getRazorpay()
  if (!razorpay) {
    throw new Error('Razorpay not initialized. Please check your environment variables.')
  }
  
  try {
    const customer = await razorpay.customers.create({
      name,
      email,
      contact: contact || '',
      fail_existing: 0, // If customer exists, return existing customer
    })
    return customer
  } catch (error) {
    console.error('Error creating Razorpay customer:', error)
    throw error
  }
}

// Create a subscription plan in Razorpay
export async function createSubscriptionPlan(planDetails: SubscriptionPlan) {
  const razorpay = getRazorpay()
  if (!razorpay) {
    throw new Error('Razorpay not initialized. Please check your environment variables.')
  }
  
  try {
    const plan = await razorpay.plans.create({
      period: planDetails.period,
      interval: planDetails.interval,
      item: {
        name: planDetails.name,
        amount: planDetails.amount,
        currency: planDetails.currency,
        description: planDetails.description,
      },
    })
    return plan
  } catch (error) {
    console.error('Error creating subscription plan:', error)
    throw error
  }
}

// Create a subscription
export async function createSubscription(customerId: string, planId: string, totalCount?: number) {
  const razorpay = getRazorpay()
  if (!razorpay) {
    throw new Error('Razorpay not initialized. Please check your environment variables.')
  }
  
  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_id: customerId,
      total_count: totalCount || 12, // 12 months for annual
      quantity: 1,
      start_at: Math.floor(Date.now() / 1000), // Start immediately
    } as any) // Type assertion to bypass strict type checking
    return subscription
  } catch (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
}

// Verify payment signature
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(orderId + '|' + paymentId)
      .digest('hex')
    
    return expectedSignature === signature
  } catch (error) {
    console.error('Error verifying payment signature:', error)
    return false
  }
}

// Verify webhook signature
export function verifyWebhookSignature(body: string, signature: string): boolean {
  try {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')
    
    return expectedSignature === signature
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  const razorpay = getRazorpay()
  if (!razorpay) {
    throw new Error('Razorpay not initialized. Please check your environment variables.')
  }
  
  try {
    const subscription = await razorpay.subscriptions.fetch(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error fetching subscription:', error)
    throw error
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string, cancelAtCycleEnd: boolean = true) {
  const razorpay = getRazorpay()
  if (!razorpay) {
    throw new Error('Razorpay not initialized. Please check your environment variables.')
  }
  
  try {
    const subscription = await razorpay.subscriptions.cancel(subscriptionId, cancelAtCycleEnd)
    return subscription
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    throw error
  }
}

// Create payment order (for one-time payments)
export async function createPaymentOrder(amount: number, currency: string = 'INR', receipt?: string) {
  const razorpay = getRazorpay()
  if (!razorpay) {
    throw new Error('Razorpay not initialized. Please check your environment variables.')
  }
  
  try {
    // Ensure receipt is under 40 characters
    const defaultReceipt = `ord_${Date.now().toString().slice(-10)}`
    const finalReceipt = receipt ? receipt.slice(0, 40) : defaultReceipt
    
    const order = await razorpay.orders.create({
      amount: amount, // amount in paise
      currency,
      receipt: finalReceipt,
      payment_capture: true, // Auto capture payment
    })
    return order
  } catch (error) {
    console.error('Error creating payment order:', error)
    throw error
  }
}

// Get payment details
export async function getPayment(paymentId: string) {
  const razorpay = getRazorpay()
  if (!razorpay) {
    throw new Error('Razorpay not initialized. Please check your environment variables.')
  }
  
  try {
    const payment = await razorpay.payments.fetch(paymentId)
    return payment
  } catch (error) {
    console.error('Error fetching payment:', error)
    throw error
  }
}

// Utility function to generate short unique receipt IDs
export function generateReceiptId(prefix: string = 'pay'): string {
  const timestamp = Date.now().toString().slice(-8) // Last 8 digits of timestamp
  const random = Math.random().toString(36).substr(2, 6) // 6 random characters
  return `${prefix}_${timestamp}_${random}`.slice(0, 40) // Ensure under 40 chars
}

export default getRazorpay
