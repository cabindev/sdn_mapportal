'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, User, LogOut, MapPin, Home, LayoutDashboard, ChevronDown, Settings } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

// Type definitions
interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

// ฟังก์ชันช่วยสำหรับการรวม classname
const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(' ');
};

const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle navbar visibility on scroll
  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > 100) {
        if (window.scrollY > lastScrollY) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Navigation items
  const navItems: NavItem[] = [
    { 
      href: '/', 
      label: 'Home',
      icon: <Home className="h-5 w-5" />
    },
    ...(isClient && status === 'authenticated' && session?.user?.role === 'ADMIN' ? [{
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      requireAuth: true,
      requireAdmin: true,
    }] : [])
  ];

  const shouldShowNavItem = (item: NavItem): boolean => {
    if (!isClient) return true;
    if (item.requireAuth && status !== 'authenticated') return false;
    if (item.requireAdmin && session?.user?.role !== 'ADMIN') return false;
    return true;
  };

  // Skip rendering the navbar on dashboard pages
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav className={cn(
      "fixed w-full top-0 z-[999] bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-transform duration-300",
      isVisible ? "translate-y-0" : "-translate-y-full"
    )}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-md">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 leading-none">SDN Map-Portal</span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center ml-8 space-x-8">
              {navItems.filter(shouldShowNavItem).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors",
                    pathname === item.href 
                      ? "text-orange-600" 
                      : "text-gray-700 hover:text-orange-600"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center">
            {/* Profile Section */}
            {isClient && status === "authenticated" && session ? (
            <div className="relative hidden md:block" ref={profileRef}>
              <button
                className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white overflow-hidden">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {session.user?.lastName?.[0] || session.user?.firstName?.[0] || "?"}
                    </span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>

                {/* Profile Dropdown - Fixed Overlay Style */}
                {isProfileOpen && (
                  <div className="fixed inset-0 z-[1000] bg-black/5 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)}>
                    <div 
                      className="absolute right-4 top-16 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-100"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="mr-3 h-4 w-4" />
                          โปรไฟล์
                        </Link>
                        
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings className="mr-3 h-4 w-4" />
                          ตั้งค่า
                        </Link>
                      </div>
                      
                      <div className="py-1 border-t border-gray-100">
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          ออกจากระบบ
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : isClient && status === "unauthenticated" ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link 
                  href="/auth/signin"
                  className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link 
                  href="/auth/signup"
                  className="text-sm font-medium bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            ) : isClient === false || status === "loading" ? (
              <div className="w-6 h-6 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            ) : null}

            {/* Mobile Menu Button - แสดงเฉพาะบนหน้าจอขนาดเล็ก */}
            <div className="md:hidden ml-4" ref={menuRef}>
              <button 
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Main menu"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>

              {/* Mobile Menu - แสดงแบบ dropdown เหมือนกับเมนู Profile */}
              {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[1000] bg-black/5 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  <div 
                    className="absolute right-4 top-16 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เมนูหลัก
                      </p>
                    </div>
                    
                    {navItems.filter(shouldShowNavItem).map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600",
                          pathname === item.href ? "bg-orange-50/50 text-orange-600" : ""
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="mr-3 text-gray-500">{item.icon}</div>
                        {item.label}
                      </Link>
                    ))}
                    
                    {/* Profile section if authenticated */}
                    {isClient && status === "authenticated" && session ? (
                      <div className="pt-2 pb-2 border-t border-gray-100 mt-2">
                        <div className="px-4 py-2">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white overflow-hidden mr-2">
                              {session.user?.image ? (
                                <img
                                  src={session.user.image}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>
                                  {session.user?.lastName?.[0] || session.user?.firstName?.[0] || "?"}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {session.user?.firstName} {session.user?.lastName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {session.user?.email}
                              </p>
                            </div>
                          </div>
                          
                          <Link
                            href="/dashboard/profile"
                            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            โปรไฟล์
                          </Link>
                          
                          <Link
                            href="/dashboard/settings"
                            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-md mt-1"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            ตั้งค่า
                          </Link>
                          
                          <button
                            onClick={() => {
                              handleSignOut();
                              setIsMobileMenuOpen(false);
                            }}
                            className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md mt-1"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            ออกจากระบบ
                          </button>
                        </div>
                      </div>
                    ) : isClient && status === "unauthenticated" ? (
                      <div className="pt-2 pb-2 border-t border-gray-100 mt-2">
                        <div className="flex flex-col space-y-2 px-3">
                          <Link
                            href="/auth/signin"
                            className="w-full py-2 px-3 rounded-md text-center text-gray-700 bg-gray-50 hover:bg-gray-100"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            เข้าสู่ระบบ
                          </Link>
                          <Link
                            href="/auth/signup"
                            className="w-full py-2 px-3 rounded-md text-center bg-orange-600 text-white hover:bg-orange-700"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            สมัครสมาชิก
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;