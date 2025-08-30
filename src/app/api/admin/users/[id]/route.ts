import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const userId = params.id

    // Find the user first to check their subscription status
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only allow deletion if user is not subscribed (subscriptionStatus is 'none' or 'expired')
    if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial' || user.subscriptionStatus === 'pending') {
      return NextResponse.json({ 
        error: 'Cannot delete user with active subscription' 
      }, { status: 400 })
    }

    // Delete the user
    await User.findByIdAndDelete(userId)

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
