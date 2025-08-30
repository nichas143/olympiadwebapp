import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// POST /api/content/cache-invalidate - Invalidate content cache
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 })
    }

    // Revalidate all content-related paths
    revalidatePath('/training/study-materials')
    revalidatePath('/training/practice-problems')
    revalidatePath('/training/mock-tests')
    revalidatePath('/training/video-lectures')
    revalidatePath('/api/content/cached')
    revalidatePath('/api/progress/cached')

    return NextResponse.json({
      message: 'Content cache invalidated successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error invalidating content cache:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
