import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      },
      isAdmin: ['admin', 'superadmin'].includes(session.user.role),
      canAccessDriveTest: ['admin', 'superadmin'].includes(session.user.role)
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to get user info',
      details: error.message
    }, { status: 500 })
  }
}
