import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'

// This endpoint should only be used for initial setup
// In production, you might want to disable this or add additional security
export async function POST(request: NextRequest) {
  try {
    // Check if this is the initial setup (no admin users exist)
    await connectDB()
    
    const existingAdmin = await User.findOne({ 
      role: { $in: ['admin', 'superadmin'] } 
    })
    
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin users already exist. This endpoint is only for initial setup.' },
        { status: 409 }
      )
    }

    const { superAdminEmail, superAdminPassword, superAdminName, adminEmail, adminPassword, adminName, initKey } = await request.json()

    // Simple security check - you should use a secure init key
    if (initKey !== process.env.ADMIN_INIT_KEY) {
      return NextResponse.json(
        { error: 'Invalid initialization key' },
        { status: 403 }
      )
    }

    // Validate required fields
    if (!superAdminEmail || !superAdminPassword || !superAdminName) {
      return NextResponse.json(
        { error: 'Super admin details are required' },
        { status: 400 }
      )
    }

    const users = []

    // Create Super Admin
    const hashedSuperAdminPassword = await bcrypt.hash(superAdminPassword, 12)
    const superAdmin = await User.create({
      name: superAdminName,
      email: superAdminEmail,
      password: hashedSuperAdminPassword,
      role: 'superadmin',
      status: 'approved', // Auto-approve admin accounts
      approvedAt: new Date(),
      approvedBy: 'system'
    })
    users.push({ id: superAdmin._id, email: superAdmin.email, role: 'superadmin' })

    // Create Regular Admin (if provided)
    if (adminEmail && adminPassword && adminName) {
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 12)
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedAdminPassword,
        role: 'admin',
        status: 'approved', // Auto-approve admin accounts
        approvedAt: new Date(),
        approvedBy: superAdmin._id.toString()
      })
      users.push({ id: admin._id, email: admin.email, role: 'admin' })
    }

    return NextResponse.json(
      { 
        message: 'Admin accounts created successfully',
        users: users
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin initialization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check if admin initialization is needed
export async function GET() {
  try {
    await connectDB()
    
    const adminCount = await User.countDocuments({ 
      role: { $in: ['admin', 'superadmin'] } 
    })
    
    return NextResponse.json({
      needsInitialization: adminCount === 0,
      adminCount
    })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
