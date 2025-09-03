'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@heroui/react';
import { UserIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCancellingPayment, setIsCancellingPayment] = useState(false);
  const [freeAccess, setFreeAccess] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    trialInfo?: { daysLeft: number; isExpired: boolean };
    subscriptionInfo?: { daysLeft: number; plan?: string; isExpired: boolean };
  } | null>(null);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
  ];

  const liveLecturesItems = [
    {
      name: 'Join Live Lectures',
      href: '/join',
      description: 'Register for live online math olympiad classes'
    },
    {
      name: 'Pre-requisites for Online Lectures',
      href: '/prerequisites',
      description: 'Student should know following areas before joining the class'
    }
  ];

  const programItems = [
    {
      name: 'Online Sample Content',
      href: '/sample-lessons',
      description: 'Watch sample video lessons to experience our teaching methodology'
    }
  ];

  const resourcesItems = [
    {
      name: 'Olympiad Curriculum',
      href: '/curriculum',
      description: 'Following topics will be taught to the student in the course'
    },
    {
      name: 'Useful Links',
      href: '/resources/useful-links',
      description: 'Curated collection of helpful websites and online resources'
    },
    {
      name: 'Reference Books',
      href: '/resources/reference-books',
      description: 'Recommended textbooks and study materials for math olympiad preparation'
    },
    {
      name: 'Self Study Guide',
      href: '/resources/self-study-guide',
      description: 'Comprehensive guide for independent learning and practice'
    }
  ];

  // Always use the same className structure to prevent hydration mismatches
  const getLinkClassName = (href: string, isActive: boolean) => {
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
    return `${baseClasses} ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`;
  };

  const getMobileLinkClassName = (href: string, isActive: boolean) => {
    const baseClasses = "block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200";
    return `${baseClasses} ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`;
  };

  const isLiveLecturesActive = mounted && (pathname === '/join' || pathname === '/prerequisites');
  const isProgramActive = mounted && (pathname === '/sample-lessons');
  const isResourcesActive = mounted && (pathname.startsWith('/resources') || pathname === '/curriculum');
  
  // Fetch free access status
  useEffect(() => {
    const fetchFreeAccessStatus = async () => {
      try {
        const response = await fetch('/api/free-access-status');
        if (response.ok) {
          const data = await response.json();
          setFreeAccess(data.freeAccess);
          console.log('FREE_ACCESS status:', data.freeAccess);
        }
      } catch (error) {
        console.error('Error fetching free access status:', error);
      }
    };

    if (mounted) {
      fetchFreeAccessStatus();
    }
  }, [mounted]);
  
  // Fetch subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch('/api/subscription/status');
        if (response.ok) {
          const data = await response.json();
          setSubscriptionInfo({
            trialInfo: data.trialInfo,
            subscriptionInfo: data.subscriptionInfo
          });
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      }
    };

    if (mounted && session) {
      fetchSubscriptionStatus();
      
      // Refresh subscription status every 5 minutes
      const interval = setInterval(fetchSubscriptionStatus, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [mounted, session]);


  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const refreshSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionInfo({
          trialInfo: data.trialInfo,
          subscriptionInfo: data.subscriptionInfo
        });
      }
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
    }
  };

  const handleCancelPayment = async () => {
    setIsCancellingPayment(true);
    try {
      const response = await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        // Refresh subscription status instead of full page refresh
        await refreshSubscriptionStatus();
      } else {
        console.error('Failed to cancel payment');
      }
    } catch (error) {
      console.error('Error cancelling payment:', error);
    } finally {
      setIsCancellingPayment(false);
      setIsUserDropdownOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl font-bold">π</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Olympiad Pi Math </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Only show navigation items when user is NOT authenticated */}
            {mounted && !session && (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={getLinkClassName(item.href, pathname === item.href)}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Live Lectures Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProgramDropdownOpen(!isProgramDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsProgramDropdownOpen(false), 150)}
                    className={getLinkClassName('/live-lectures', isLiveLecturesActive)}
                  >
                    <span className="flex items-center">
                      Live Lectures
                      <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                        isProgramDropdownOpen ? 'rotate-180' : ''
                      }`} />
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isProgramDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-2">
                        {liveLecturesItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => setIsProgramDropdownOpen(false)}
                          >
                            <div className="font-medium text-gray-900 mb-1">{item.name}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* More Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsMoreDropdownOpen(false), 150)}
                    className={getLinkClassName('/more', false)}
                  >
                    <span className="flex items-center">
                     Online Content 
                      <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                        isMoreDropdownOpen ? 'rotate-180' : ''
                      }`} />
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isMoreDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-2">
                        {/* Program Items */}
                        {programItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => setIsMoreDropdownOpen(false)}
                          >
                            <div className="font-medium text-gray-900 mb-1">{item.name}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </Link>
                        ))}
                        
                        <hr className="my-2" />
                        
                        {/* Pricing Section */}
                        <div className="px-4 py-2">
                          <div className="font-medium text-gray-900 mb-1">💰 Pricing Plans</div>
                          <div className="text-sm text-gray-600 mb-2">
                            {freeAccess ? (
                              <span className="text-green-600 font-medium">🎉 Currently FREE Access!</span>
                            ) : (
                              <span>Monthly ₹300 • Yearly ₹3000</span>
                            )}
                          </div>
                          <Link
                            href="/pricing"
                            className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                            onClick={() => setIsMoreDropdownOpen(false)}
                          >
                            View Plans
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resources Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsResourcesDropdownOpen(!isResourcesDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsResourcesDropdownOpen(false), 150)}
                    className={getLinkClassName('/resources', isResourcesActive)}
                  >
                    <span className="flex items-center">
                      Resources
                      <svg
                        className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                          isResourcesDropdownOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isResourcesDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-2">
                        {resourcesItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => setIsResourcesDropdownOpen(false)}
                          >
                            <div className="font-medium text-gray-900 mb-1">{item.name}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Authentication */}
            {mounted && status === 'loading' ? (
              <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
            ) : mounted && session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsUserDropdownOpen(false), 150)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>{session.user?.name}</span>
                  <svg
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isUserDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      {/* Subscription Status */}
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Subscription
                        </div>
                        {session.user?.subscriptionStatus === 'active' && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600 font-medium">Active</span>
                            {session.user?.subscriptionPlan && (
                              <span className="text-xs text-gray-500">
                                ({session.user.subscriptionPlan === 'annual' ? 'Annual' : 
                                  session.user.subscriptionPlan === 'student_annual' ? 'Student' :
                                  session.user.subscriptionPlan === 'yearly' ? 'Yearly' :
                                  session.user.subscriptionPlan === 'monthly' ? 'Monthly' : 'Plan'})
                              </span>
                            )}
                            {subscriptionInfo?.subscriptionInfo?.daysLeft !== undefined && (
                              <span className={`text-xs ${
                                subscriptionInfo.subscriptionInfo.daysLeft <= 7 
                                  ? 'text-orange-600 font-medium' 
                                  : 'text-gray-500'
                              }`}>
                                ({subscriptionInfo.subscriptionInfo.daysLeft} days left
                                {subscriptionInfo.subscriptionInfo.daysLeft <= 7 && ' ⚠️'})
                              </span>
                            )}
                          </div>
                        )}
                        {session.user?.subscriptionStatus === 'trial' && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-blue-600 font-medium">Free Trial</span>
                            {subscriptionInfo?.trialInfo?.daysLeft !== undefined && (
                              <span className={`text-xs ${
                                subscriptionInfo.trialInfo.daysLeft <= 3 
                                  ? 'text-orange-600 font-medium' 
                                  : 'text-gray-500'
                              }`}>
                                ({subscriptionInfo.trialInfo.daysLeft} days left
                                {subscriptionInfo.trialInfo.daysLeft <= 3 && ' ⚠️'})
                              </span>
                            )}
                          </div>
                        )}
                        {session.user?.subscriptionStatus === 'pending' && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm text-yellow-600 font-medium">Payment Processing</span>
                          </div>
                        )}
                        {(!session.user?.subscriptionStatus || session.user?.subscriptionStatus === 'none') && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-sm text-gray-600">No Subscription</span>
                          </div>
                        )}
                        {(session.user?.subscriptionStatus === 'expired' || session.user?.subscriptionStatus === 'cancelled') && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm text-red-600 font-medium">Expired</span>
                          </div>
                        )}
                      </div>

                      {(session.user?.role === 'admin' || session.user?.role === 'superadmin') ? (
                        <>
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            {session.user?.role === 'superadmin' ? 'Super Admin Panel' : 'Admin Panel'}
                          </Link>
                          <Link
                            href="/admin/content"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            📚 Content Management
                          </Link>
                          {session.user?.role === 'superadmin' && (
                            <Link
                              href="/dashboard"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setIsUserDropdownOpen(false)}
                            >
                              Student View
                            </Link>
                          )}
                        </>
                      ) : (
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        📊 Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        👤 Profile
                      </Link>
                      {!freeAccess && (!session.user?.subscriptionStatus || 
                        session.user?.subscriptionStatus === 'none' || 
                        session.user?.subscriptionStatus === 'expired' || 
                        session.user?.subscriptionStatus === 'cancelled') && (
                        <Link
                          href="/pricing"
                          className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          🚀 Upgrade to Premium
                        </Link>
                      )}
                      {!freeAccess && session.user?.subscriptionStatus === 'active' && 
                        subscriptionInfo?.subscriptionInfo?.daysLeft !== undefined && 
                        subscriptionInfo.subscriptionInfo.daysLeft <= 7 && (
                        <Link
                          href="/pricing"
                          className="block px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 font-medium"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          🔄 Renew Subscription
                        </Link>
                      )}
                      {session.user?.subscriptionStatus === 'trial' && 
                        subscriptionInfo?.trialInfo?.daysLeft !== undefined && 
                        subscriptionInfo.trialInfo.daysLeft <= 3 && (
                        <Link
                          href="/pricing"
                          className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          🚀 Upgrade to Premium
                        </Link>
                      )}
                      {session.user?.subscriptionStatus === 'pending' && (
                        <button
                          onClick={handleCancelPayment}
                          disabled={isCancellingPayment}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium disabled:opacity-50"
                        >
                          {isCancellingPayment ? 'Cancelling...' : '❌ Cancel Pending Payment'}
                        </button>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin">
                  <Button variant="light" color="primary">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button color="primary">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => mounted && setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              disabled={!mounted}
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mounted && isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {/* Only show navigation items when user is NOT authenticated */}
            {!session && (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={getMobileLinkClassName(item.href, pathname === item.href)}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Mobile Live Lectures Section */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Live Lectures
                  </div>
                  {liveLecturesItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={getMobileLinkClassName(item.href, pathname === item.href)}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                    </Link>
                  ))}
                </div>

                                 {/* Mobile More Section */}
                 <div className="border-t border-gray-200 pt-2 mt-2">
                   <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    More 
                   </div>
                   {programItems.map((item) => (
                     <Link
                       key={item.name}
                       href={item.href}
                       className={getMobileLinkClassName(item.href, pathname === item.href)}
                       onClick={() => setIsMobileMenuOpen(false)}
                     >
                       <div className="font-medium">{item.name}</div>
                       <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                     </Link>
                   ))}
                   
                   {/* Mobile Pricing Section */}
                   <div className="px-3 py-2 border-t border-gray-100 mt-2">
                     <div className="font-medium text-gray-900 mb-1">💰 Pricing Plans</div>
                     <div className="text-sm text-gray-600 mb-2">
                       {freeAccess ? (
                         <span className="text-green-600 font-medium">🎉 Currently FREE Access!</span>
                       ) : (
                         <span>Monthly ₹300 • Yearly ₹3000</span>
                       )}
                     </div>
                     <Link
                       href="/pricing"
                       className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                       onClick={() => setIsMobileMenuOpen(false)}
                     >
                       View Plans
                     </Link>
                   </div>
                 </div>

                {/* Mobile Resources Section */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Resources
                  </div>
                  {resourcesItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={getMobileLinkClassName(item.href, pathname === item.href)}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* Mobile Authentication */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              {session ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </div>
                  {(session.user?.role === 'admin' || session.user?.role === 'superadmin') ? (
                    <>
                      <Link
                        href="/admin"
                        className={getMobileLinkClassName('/admin', pathname === '/admin')}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {session.user?.role === 'superadmin' ? 'Super Admin Panel' : 'Admin Panel'}
                      </Link>
                      <Link
                        href="/admin/content"
                        className={getMobileLinkClassName('/admin/content', pathname === '/admin/content')}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        📚 Content Management
                      </Link>
                      {session.user?.role === 'superadmin' && (
                        <Link
                          href="/dashboard"
                          className={getMobileLinkClassName('/dashboard', pathname === '/dashboard')}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Student View
                        </Link>
                      )}
                    </>
                  ) : (
                    <Link
                      href="/dashboard"
                      className={getMobileLinkClassName('/dashboard', pathname === '/dashboard')}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className={getMobileLinkClassName('/profile', pathname === '/profile')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <Link
                    href="/auth/signin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
