import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'
import { verifyPaymentSignature } from '@/lib/razorpay'

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

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await request.json()

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      )
    }

    // Verify payment signature
    const isValidSignature = await verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
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

    // Activate subscription for 1 month
    const subscriptionEndDate = new Date()
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1)

    await User.findByIdAndUpdate(user._id, {
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: subscriptionEndDate,
      lastPaymentDate: new Date(),
      nextBillingDate: subscriptionEndDate,
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription activated',
      paymentId: razorpay_payment_id
    })

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
