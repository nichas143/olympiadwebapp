import Razorpay from 'razorpay'

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

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

// Subscription plans configuration
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  annual: {
    id: 'annual',
    name: 'Annual Plan',
    amount: IS_TESTING ? 500 : 399900, // ₹5 for testing, ₹3,999 for production (in paise)
    currency: 'INR',
    period: 'yearly',
    interval: 1,
    description: 'Full access to all content for 1 year'
  },
  student_annual: {
    id: 'student_annual',
    name: 'Student Annual Plan',
    amount: IS_TESTING ? 500 : 199900, // ₹5 for testing, ₹1,999 for production (in paise)
    currency: 'INR',
    period: 'yearly',
    interval: 1,
    description: 'Student discount - Full access for 1 year'
  }
}

// Helper function to check if we're in testing mode
export const isTestingMode = () => IS_TESTING

// Create a customer in Razorpay
export async function createRazorpayCustomer(name: string, email: string, contact?: string) {
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
  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_id: customerId,
      total_count: totalCount || 12, // 12 months for annual
      quantity: 1,
      start_at: Math.floor(Date.now() / 1000), // Start immediately
      notify: {
        email: true,
        sms: false,
      },
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

export default razorpay
