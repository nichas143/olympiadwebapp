import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'
import { getSubscription } from '@/lib/razorpay'

export async function GET(request: NextRequest) {
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

    // Check subscription status
    let subscriptionDetails = null
    if (user.razorpaySubscriptionId) {
      try {
        subscriptionDetails = await getSubscription(user.razorpaySubscriptionId)
      } catch (error) {
        console.error('Error fetching subscription from Razorpay:', error)
      }
    }

    // Calculate trial info if applicable
    let trialInfo = null
    if (user.subscriptionStatus === 'trial' && user.trialEndDate) {
      const now = new Date()
      const trialEnd = new Date(user.trialEndDate)
      const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      
      trialInfo = {
        daysLeft,
        endDate: user.trialEndDate,
        isExpired: daysLeft === 0
      }
    }

    // Calculate subscription info if applicable
    let subscriptionInfo = null
    if (user.subscriptionStatus === 'active' && user.subscriptionEndDate) {
      const now = new Date()
      const subEnd = new Date(user.subscriptionEndDate)
      const daysLeft = Math.max(0, Math.ceil((subEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      
      subscriptionInfo = {
        plan: user.subscriptionPlan,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        daysLeft,
        amount: user.subscriptionAmount,
        nextBillingDate: user.nextBillingDate,
        isExpired: daysLeft === 0
      }
    }

    return NextResponse.json({
      subscriptionStatus: user.subscriptionStatus,
      trialInfo,
      subscriptionInfo,
      razorpaySubscriptionDetails: subscriptionDetails,
      hasAccess: ['trial', 'active'].includes(user.subscriptionStatus)
    })

  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    )
  }
}
