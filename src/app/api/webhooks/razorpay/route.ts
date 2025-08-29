import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'
import { verifyWebhookSignature } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      console.error('No signature provided')
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const isValidSignature = await verifyWebhookSignature(body, signature)
    if (!isValidSignature) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)
    console.log('Razorpay webhook event:', event.event, event.payload)

    await connectDB()

    switch (event.event) {
      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.subscription.entity, event.payload.payment.entity)
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity)
        break

      case 'subscription.completed':
        await handleSubscriptionCompleted(event.payload.subscription.entity)
        break

      case 'subscription.halted':
        await handleSubscriptionHalted(event.payload.subscription.entity)
        break

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity)
        break

      default:
        console.log('Unhandled webhook event:', event.event)
    }

    return NextResponse.json({ status: 'ok' })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCharged(
  subscription: { id: string; current_end?: number },
  payment: { created_at: number }
) {
  try {
    console.log('Processing subscription charged event:', subscription.id)

    const user = await User.findOne({ razorpaySubscriptionId: subscription.id })
    if (!user) {
      console.error('User not found for subscription:', subscription.id)
      return
    }

    // Update user subscription status
    const updateData: {
      subscriptionStatus: string;
      lastPaymentDate: Date;
      updatedAt: Date;
      nextBillingDate?: Date;
      subscriptionEndDate?: Date;
    } = {
      subscriptionStatus: 'active',
      lastPaymentDate: new Date(payment.created_at * 1000),
      updatedAt: new Date()
    }

    // Calculate next billing date (1 year from current charge)
    if (subscription.current_end) {
      updateData.nextBillingDate = new Date(subscription.current_end * 1000)
      updateData.subscriptionEndDate = new Date(subscription.current_end * 1000)
    }

    await User.findByIdAndUpdate(user._id, updateData)
    
    console.log('Subscription charged successfully for user:', user.email)

  } catch (error) {
    console.error('Error handling subscription charged:', error)
  }
}

async function handleSubscriptionCancelled(subscription: { id: string }) {
  try {
    console.log('Processing subscription cancelled event:', subscription.id)

    const user = await User.findOne({ razorpaySubscriptionId: subscription.id })
    if (!user) {
      console.error('User not found for subscription:', subscription.id)
      return
    }

    await User.findByIdAndUpdate(user._id, {
      subscriptionStatus: 'cancelled',
      updatedAt: new Date()
    })

    console.log('Subscription cancelled for user:', user.email)

  } catch (error) {
    console.error('Error handling subscription cancelled:', error)
  }
}

async function handleSubscriptionCompleted(subscription: { id: string }) {
  try {
    console.log('Processing subscription completed event:', subscription.id)

    const user = await User.findOne({ razorpaySubscriptionId: subscription.id })
    if (!user) {
      console.error('User not found for subscription:', subscription.id)
      return
    }

    await User.findByIdAndUpdate(user._id, {
      subscriptionStatus: 'expired',
      updatedAt: new Date()
    })

    console.log('Subscription completed for user:', user.email)

  } catch (error) {
    console.error('Error handling subscription completed:', error)
  }
}

async function handleSubscriptionHalted(subscription: { id: string }) {
  try {
    console.log('Processing subscription halted event:', subscription.id)

    const user = await User.findOne({ razorpaySubscriptionId: subscription.id })
    if (!user) {
      console.error('User not found for subscription:', subscription.id)
      return
    }

    await User.findByIdAndUpdate(user._id, {
      subscriptionStatus: 'expired',
      updatedAt: new Date()
    })

    console.log('Subscription halted for user:', user.email)

  } catch (error) {
    console.error('Error handling subscription halted:', error)
  }
}

async function handlePaymentFailed(payment: { id: string; subscription_id?: string }) {
  try {
    console.log('Processing payment failed event:', payment.id)

    // Find user by subscription ID if available
    if (payment.subscription_id) {
      const user = await User.findOne({ razorpaySubscriptionId: payment.subscription_id })
      if (user) {
        // You might want to send an email notification here
        console.log('Payment failed for user:', user.email)
        
        // Optionally update subscription status based on your business logic
        // await User.findByIdAndUpdate(user._id, {
        //   subscriptionStatus: 'expired',
        //   updatedAt: new Date()
        // })
      }
    }

  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}
