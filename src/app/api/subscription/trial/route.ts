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

    // Check if user is eligible for trial
    if (user.subscriptionStatus !== 'none') {
      return NextResponse.json(
        { error: 'User is not eligible for trial' },
        { status: 400 }
      )
    }

    // Check if user has already used trial
    if (user.trialStartDate) {
      return NextResponse.json(
        { error: 'Trial already used' },
        { status: 400 }
      )
    }

    // Start trial (14 days)
    const trialStartDate = new Date()
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 14) // 14-day trial

    await User.findByIdAndUpdate(user._id, {
      subscriptionStatus: 'trial',
      trialStartDate,
      trialEndDate,
      updatedAt: new Date()
    })

    return NextResponse.json({
      message: 'Trial started successfully',
      trialStartDate,
      trialEndDate,
      daysLeft: 14
    })

  } catch (error) {
    console.error('Error starting trial:', error)
    return NextResponse.json(
      { error: 'Failed to start trial' },
      { status: 500 }
    )
  }
}
