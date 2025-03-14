// app/components/Navbar.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation';
import { HiMenuAlt3 } from "react-icons/hi";
import { IoIosArrowDown } from "react-icons/io";
import { FiUser, FiLogOut, FiSettings } from "react-icons/fi";

// Define Types
interface SubNavItem {
  href: string;
  label: string;
}

interface NavItem {
  href: string;
  label: string;
  subItems?: SubNavItem[];
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Use useEffect to fix hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Define navigation items with proper typing
  const navItems: NavItem[] = [
    { 
      href: '/', 
      label: 'Home' 
    },
    // Show Dashboard only when session is confirmed and user is ADMIN
    ...(isClient && status === 'authenticated' && session?.user?.role === 'ADMIN' ? [{
      href: '/dashboard',
      label: 'Dashboard',
      requireAuth: true,
      requireAdmin: true,
    }] : [])
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSubmenu = (href: string) => {
    setOpenSubmenu(openSubmenu === href ? null : href);
  };

  const shouldShowNavItem = (item: NavItem): boolean => {
    if (!isClient) return true;
    if (item.requireAuth && status !== 'authenticated') return false;
    if (item.requireAdmin && session?.user?.role !== 'ADMIN') return false;
    return true;
  };

  const renderNavItem = (item: NavItem) => {
    if (!shouldShowNavItem(item)) return null;

    if (item.subItems && item.subItems.length > 0) {
      return (
        <div key={item.href} className="relative">
          <button
            onClick={() => toggleSubmenu(item.href)}
            className="inline-flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors"
          >
            <span>{item.label}</span>
            <IoIosArrowDown 
              className={`w-4 h-4 transition-transform duration-200 ${
                openSubmenu === item.href ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {openSubmenu === item.href && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100">
              {item.subItems.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  onClick={() => setOpenSubmenu(null)}
                >
                  {subItem.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`${
          pathname === item.href ? 'text-orange-600' : 'text-gray-700'
        } hover:text-orange-600 transition-colors`}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="bg-transparent backdrop-blur-sm border-b border-gray-100/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            {isClient ? (
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-orange-600">
                  SDN
                </span>
                <span className="text-2xl font-normal text-gray-700">
                  Map Portal
                </span>
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-orange-600">
                  SDN
                </span>
                <span className="text-2xl font-normal text-gray-700">
                  Map Portal
                </span>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => renderNavItem(item))}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isClient && status === 'authenticated' && session ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 group"
                >
                  <div className="w-10 h-10 rounded-full ring-2 ring-gray-200 overflow-hidden">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="rounded-full object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {session.user?.lastName?.[0] || session.user?.firstName?.[0] || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  <IoIosArrowDown className="w-4 h-4 text-gray-600 group-hover:text-orange-600 transition-colors" />
                </button>

                {/* User menu dropdown */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl py-2 border border-gray-100 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {session.user?.firstName} {session.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    
                    <div className="py-1">
                      <Link 
                        href="/dashboard/profile" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiUser className="mr-3 h-4 w-4" />
                        Profile
                      </Link>
                      

                    </div>
                    
                    <div className="py-1 border-t border-gray-100">
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <FiLogOut className="mr-3 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : isClient === false || status === 'loading' ? (
              // Show loading indicator while checking session
              <div className="w-6 h-6 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            ) : (
              // Hide sign in/sign up buttons on small screens, show only on larger screens
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 text-sm font-medium hover:text-orange-600 transition-colors flex items-center"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
                >
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5">
                    <svg
                      stroke="currentColor"
                      fill="none"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  <span>Sign up</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100/30 transition-colors"
            >
              <HiMenuAlt3 className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Single implementation with improved styling */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-sm border-t border-gray-100/30">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.filter(shouldShowNavItem).map((item) => (
              <div key={item.href}>
                {item.subItems && item.subItems.length > 0 ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.href)}
                      className="w-full flex items-center justify-between px-3 py-2 text-base text-gray-700 hover:bg-gray-50/50 transition-colors"
                    >
                      <span>{item.label}</span>
                      <IoIosArrowDown className={`
                        w-4 h-4 transition-transform duration-200
                        ${openSubmenu === item.href ? 'rotate-180' : ''}
                      `} />
                    </button>

                    {openSubmenu === item.href && (
                      <div className="bg-gray-50/50">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className="block pl-6 pr-4 py-2 text-base text-gray-700 hover:bg-orange-50/50 hover:text-orange-600 transition-colors"
                            onClick={() => {
                              setOpenSubmenu(null);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`
                      block px-3 py-2 text-base text-gray-700 hover:bg-gray-50/50 transition-colors
                      ${pathname === item.href ? 'text-orange-600' : ''}
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Always show auth options in mobile menu */}
            {isClient && status === 'authenticated' ? (
              <div className="pt-4 pb-2 border-t border-gray-200/30">
                <div className="space-y-1">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center px-3 py-2 text-base text-gray-700 hover:bg-gray-50/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiUser className="mr-3 h-5 w-5" />
                    Profile
                  </Link>
                 
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-base text-gray-700 hover:bg-gray-50/50"
                  >
                    <FiLogOut className="mr-3 h-5 w-5" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : isClient && status !== 'authenticated' ? (
              <div className="pt-4 pb-2 border-t border-gray-200/30">
                <div className="flex flex-col space-y-2 px-3">
                  <Link
                    href="/auth/signin"
                    className="text-center text-gray-700 py-2 hover:text-orange-600 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="flex items-center justify-center gap-1 bg-black text-white font-medium py-2 rounded-full hover:bg-gray-800 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="inline-flex items-center justify-center w-4 h-4">
                      <svg
                        stroke="currentColor"
                        fill="none"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                    <span>Sign up</span>
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;