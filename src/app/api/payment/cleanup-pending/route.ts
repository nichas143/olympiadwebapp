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

    // Check if user has a pending payment that's older than 30 minutes
    if (user.subscriptionStatus === 'pending' && user.updatedAt) {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      
      if (user.updatedAt < thirtyMinutesAgo) {
        // Reset stale pending payment
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
          message: 'Stale pending payment cleaned up',
          status: 'cleaned'
        })
      }
    }

    return NextResponse.json({
      message: 'No stale pending payments found',
      status: user.subscriptionStatus
    })

  } catch (error) {
    console.error('Error cleaning up pending payments:', error)
    return NextResponse.json(
      { error: 'Failed to clean up pending payments' },
      { status: 500 }
    )
  }
}
