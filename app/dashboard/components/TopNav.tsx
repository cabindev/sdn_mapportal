'use client'

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { signOut } from 'next-auth/react'
import { useDashboard } from '../context/DashboardContext'
import { Bell, User, LogOut, Menu, ChevronDown, Home } from "lucide-react"

interface TopNavProps { user: any }

export default function TopNav({ user }: TopNavProps) {
  const pathname = usePathname()
  const { toggleMobileSidebar } = useDashboard()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navTabs = [
    { href: '/dashboard', text: 'ภาพรวม' },
    { href: '/dashboard/provinces', text: 'จังหวัด' },
    { href: '/dashboard/documents', text: 'เอกสาร' },
    { href: '/dashboard/categories', text: 'หมวดหมู่' },
    { href: '/dashboard/map', text: 'แผนที่' }
  ]

  return (
    <header className="bg-white/70 backdrop-blur border-b border-neutral-200 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Mobile menu button */}
        <button
          onClick={() => toggleMobileSidebar(true)}
          className="lg:hidden p-2 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Logo with Home Link */}
        <Link href="/" className="lg:hidden flex items-center gap-2 group">
          <Home className="w-4 h-4 text-neutral-500 group-hover:text-neutral-700 transition-colors" />
          <span className="text-lg font-medium text-neutral-900 group-hover:text-neutral-700 transition-colors">SDN Map</span>
        </Link>
        
        {/* Right */}
        <div className="flex items-center space-x-4">
          {/* Home Link for Desktop */}
          <Link 
            href="/" 
            className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm font-light text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-200 group"
            title="กลับหน้าหลัก"
          >
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>หน้าหลัก</span>
          </Link>

          <button className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 rounded-full">
            <Bell className="w-5 h-5" />
          </button>
          
          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-3 p-2 rounded-full hover:bg-neutral-200 transition"
            >
              <div className="w-8 h-8 bg-neutral-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-neutral-700">
                  {user?.firstName?.charAt(0) || user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-neutral-900">{user?.firstName || user?.name || ""} {user?.lastName || ""}</div>
                <div className="text-xs text-neutral-500">{user?.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </button>
            
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur shadow-xl border border-neutral-200 rounded-xl py-2 z-20 animate-fade-in">
                <div className="px-4 py-2 border-b border-neutral-100">
                  <div className="text-sm font-medium text-neutral-900">{user?.firstName || user?.name || ""} {user?.lastName || ""}</div>
                  <div className="text-xs text-neutral-500">{user?.email || ""}</div>
                </div>
                
                {/* Home Link in Dropdown for Mobile */}
                <Link
                  href="/"
                  className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 lg:hidden"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <Home className="w-4 h-4 mr-3" /> หน้าหลัก
                </Link>
                
                <Link
                  href="/dashboard/profile"
                  className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <User className="w-4 h-4 mr-3" /> โปรไฟล์
                </Link>
                
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                >
                  <LogOut className="w-4 h-4 mr-3" /> ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation tabs */}
      <nav className="border-t border-neutral-100 bg-white/50 backdrop-blur">
        <div className="flex overflow-x-auto scrollbar-hide">
          {navTabs.map(tab => {
            const isActive = 
              tab.href === '/dashboard' 
                ? pathname === '/dashboard'
                : pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition
                  ${isActive
                    ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
                  }
                `}
              >
                {tab.text}
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}