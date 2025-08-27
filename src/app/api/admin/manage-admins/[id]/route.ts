import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'

// DELETE /api/admin/manage-admins/[id] - Remove admin user (superadmin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized. Superadmin access required.' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const adminUser = await User.findById(id)
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
    }

    // Prevent deleting self
    if (adminUser._id.toString() === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Only allow deleting admin/superadmin users
    if (!['admin', 'superadmin'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'Can only delete admin users' }, { status: 400 })
    }

    await User.findByIdAndDelete(id)

    return NextResponse.json({ 
      message: 'Admin user deleted successfully',
      deletedUser: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    })
  } catch (error) {
    console.error('Error deleting admin user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/manage-admins/[id] - Update admin user role (superadmin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized. Superadmin access required.' }, { status: 401 })
    }

    const { role } = await request.json()

    if (!role || !['admin', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be admin or superadmin.' }, { status: 400 })
    }

    await connectDB()

    const { id } = await params
    const adminUser = await User.findById(id)
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
    }

    // Prevent changing own role
    if (adminUser._id.toString() === session.user.id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
    }

    // Only allow updating admin/superadmin users
    if (!['admin', 'superadmin'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'Can only update admin users' }, { status: 400 })
    }

    adminUser.role = role
    await adminUser.save()

    // Remove password from response
    const { password, ...updatedAdmin } = adminUser.toObject()

    return NextResponse.json({ 
      message: 'Admin user role updated successfully',
      admin: updatedAdmin
    })
  } catch (error) {
    console.error('Error updating admin user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
