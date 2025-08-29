import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// Check if content is free to access
const FREE_ACCESS = process.env.FREE_ACCESS === 'true'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/training',
    '/video-lectures',
    '/practice-problems',
    '/progress',
    '/profile'
  ]

  // Premium routes that require active subscription
  const premiumRoutes = [
    '/training/study-materials',
    '/training/video-lectures',
    '/training/practice-problems'
  ]

  // Admin routes that require admin role
  const adminRoutes = ['/admin']

  // Auth routes (signin, signup)
  const authRoutes = ['/auth/signin', '/auth/signup']

  // Payment and subscription routes
  const paymentRoutes = ['/pricing', '/payment', '/subscription']

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if the current path is a premium route
  const isPremiumRoute = premiumRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if the current path is an admin route
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if the current path is a payment route
  const isPaymentRoute = paymentRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Redirect to signin if accessing protected route without authentication
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  // Redirect to signin if accessing admin route without authentication
  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  // Check subscription for premium routes
  if (isPremiumRoute && isLoggedIn) {
    // If FREE_ACCESS is enabled, allow all authenticated users
    if (FREE_ACCESS) {
      return NextResponse.next()
    }
    
    // Otherwise, check subscription status
    const subscriptionStatus = req.auth?.user?.subscriptionStatus
    
    // If user doesn't have active subscription or trial, redirect to pricing
    // Note: 'pending' status should NOT give access - only 'active' and 'trial' should
    if (!subscriptionStatus || !['trial', 'active'].includes(subscriptionStatus)) {
      return NextResponse.redirect(new URL('/pricing', req.url))
    }
  }

  // Redirect to dashboard if accessing admin route without admin role
  if (isAdminRoute && isLoggedIn) {
    const userRole = req.auth?.user?.role
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Redirect to appropriate dashboard based on role when accessing auth routes while logged in
  if (isAuthRoute && isLoggedIn) {
    const userRole = req.auth?.user?.role
    const redirectUrl = (userRole === 'admin' || userRole === 'superadmin') ? '/admin' : '/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  return NextResponse.next()
})

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
