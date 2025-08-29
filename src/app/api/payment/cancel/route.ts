import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'

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

    await connectDB()

    // Get user details
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only reset if status is 'pending' (payment was interrupted)
    if (user.subscriptionStatus === 'pending') {
      await User.findByIdAndUpdate(user._id, {
        subscriptionStatus: 'none',
        subscriptionPlan: null,
        subscriptionStartDate: null,
        subscriptionEndDate: null,
        razorpaySubscriptionId: null,
        subscriptionAmount: null,
        nextBillingDate: null,
        updatedAt: new Date()
      })

      return NextResponse.json({
        message: 'Payment cancelled successfully',
        status: 'cancelled'
      })
    }

    return NextResponse.json({
      message: 'No pending payment to cancel',
      status: user.subscriptionStatus
    })

  } catch (error) {
    console.error('Error cancelling payment:', error)
    return NextResponse.json(
      { error: 'Failed to cancel payment' },
      { status: 500 }
    )
  }
}
