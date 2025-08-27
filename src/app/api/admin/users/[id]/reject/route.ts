import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'
import { sendRejectionEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reason } = await request.json()

    await connectDB()

    const { id } = await params
    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.status === 'rejected') {
      return NextResponse.json({ error: 'User already rejected' }, { status: 400 })
    }

    // Update user status
    user.status = 'rejected'
    user.approvedBy = session.user.id
    await user.save()

    // Send rejection email
    try {
      await sendRejectionEmail(user.email, user.name, reason)
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError)
      // Don't fail the rejection if email fails
    }

    return NextResponse.json({ 
      message: 'User rejected successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    })
  } catch (error) {
    console.error('Error rejecting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
