import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'
import { 
  createRazorpayCustomer, 
  createPaymentOrder,
  SUBSCRIPTION_PLANS 
} from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { planType } = await request.json()

    // Validate plan type
    if (!['monthly', 'yearly'].includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type. Please select monthly or yearly plan.' },
        { status: 400 }
      )
    }

    // Validate plan type
    if (!SUBSCRIPTION_PLANS[planType]) {
      return NextResponse.json(
        { error: 'Plan configuration not found' },
        { status: 400 }
      )
    }

    await connectDB()

    // Get user details
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already has an active subscription
    if (user.subscriptionStatus === 'active') {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      )
    }

    const plan = SUBSCRIPTION_PLANS[planType]

    // Create or get Razorpay customer
    let customerId = user.razorpayCustomerId
    
    if (!customerId) {
      const customer = await createRazorpayCustomer(
        user.name,
        user.email
      )
      customerId = customer.id

      // Update user with customer ID
      await User.findByIdAndUpdate(user._id, {
        razorpayCustomerId: customerId
      })
    }

    // Create payment order for monthly subscription
    const order = await createPaymentOrder(
      plan.amount,
      'INR',
      `monthly_${user._id.toString().slice(-8)}_${Date.now().toString().slice(-8)}`
    )

    // Set subscription to pending (will be activated after payment)
    const subscriptionStartDate = new Date()
    const subscriptionEndDate = new Date()
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1) // Monthly plan

    await User.findByIdAndUpdate(user._id, {
      subscriptionStatus: 'pending',
      subscriptionPlan: planType,
      subscriptionStartDate,
      subscriptionEndDate,
      subscriptionAmount: plan.amount,
      nextBillingDate: subscriptionEndDate,
      updatedAt: new Date()
    })

    return NextResponse.json({
      orderId: order.id,
      amount: plan.amount,
      currency: 'INR',
      planDetails: plan,
      customerId: customerId,
      keyId: process.env.RAZORPAY_KEY_ID,
      status: 'created',
      user: {
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error('Error creating payment order:', error)
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
