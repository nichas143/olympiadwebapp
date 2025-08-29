import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    // Check if free access is enabled
    if (process.env.FREE_ACCESS !== 'true') {
      return NextResponse.json(
        { error: 'Free access is not currently enabled' },
        { status: 403 }
      )
    }

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

    // Calculate subscription dates based on plan type
    const subscriptionStartDate = new Date()
    const subscriptionEndDate = new Date()
    
    if (planType === 'yearly') {
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1)
    } else {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1)
    }

    // Activate free subscription
    await User.findByIdAndUpdate(user._id, {
      subscriptionStatus: 'active',
      subscriptionPlan: planType,
      subscriptionStartDate,
      subscriptionEndDate,
      subscriptionAmount: 0, // Free subscription
      nextBillingDate: subscriptionEndDate,
      updatedAt: new Date()
    })

    return NextResponse.json({
      message: 'Free subscription activated successfully!',
      planType,
      subscriptionStartDate,
      subscriptionEndDate,
      status: 'activated'
    })

  } catch (error) {
    console.error('Error activating free subscription:', error)
    return NextResponse.json(
      { error: 'Failed to activate free subscription' },
      { status: 500 }
    )
  }
}
