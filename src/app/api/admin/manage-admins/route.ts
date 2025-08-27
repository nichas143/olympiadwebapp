import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'
import bcrypt from 'bcryptjs'

// GET /api/admin/manage-admins - Get all admin users (superadmin only)
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized. Superadmin access required.' }, { status: 401 })
    }

    await connectDB()

    const admins = await User.find({ 
      role: { $in: ['admin', 'superadmin'] } 
    })
    .select('-password')
    .sort({ createdAt: -1 })

    return NextResponse.json({ admins })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/manage-admins - Create new admin (superadmin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized. Superadmin access required.' }, { status: 401 })
    }

    const { name, email, password, role } = await request.json()

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['admin', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be admin or superadmin.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 })
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new admin user
    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status: 'approved', // Auto-approve admin accounts
      approvedAt: new Date(),
      approvedBy: session.user.id
    })

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = newAdmin.toObject()

    return NextResponse.json(
      { 
        message: 'Admin user created successfully',
        admin: adminWithoutPassword
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
