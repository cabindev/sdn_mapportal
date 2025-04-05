// app/dashboard/components/TopNav.tsx
'use client'

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { signOut } from 'next-auth/react'
import { useDashboard } from '../context/DashboardContext'
import { cn } from "../../lib/utils"
import { 
  Bell, 
  Search, 
  User,
  LogOut,
  Menu
} from "lucide-react"

interface TopNavProps {
  user: any
}

export default function TopNav({ user }: TopNavProps) {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar, toggleMobileSidebar } = useDashboard()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  
  // Define navigation tabs
  const navTabs = [
    { href: '/dashboard', text: 'ภาพรวม' },
    { href: '/dashboard/provinces', text: 'ภาพรวมจังหวัด' },
    { href: '/dashboard/documents', text: 'เอกสาร' },
    { href: '/dashboard/categories', text: 'หมวดหมู่' },
    { href: '/dashboard/map', text: 'แผนที่' }
  ]

  return (
    <header className="h-auto bg-white shadow-sm">
      {/* Main header with search and profile */}
      <div className="h-12 flex items-center px-2 sm:px-4 border-b border-gray-100">
        {/* ปุ่ม hamburger สำหรับมือถือ */}
        <button
          onClick={() => toggleMobileSidebar(true)}
          className="lg:hidden mr-2 p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
          aria-label="เปิดเมนู"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-shrink-0 flex items-center mr-2">
        <Link href="/" className="text-base font-bold text-gray-600 hidden md:block hover:text-amber-700 transition-colors">
            SDN Map Portal
        </Link>
        </div>
        

        
        <div className="flex items-center ml-auto">
          <button 
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none"
            aria-label="การแจ้งเตือน"
          >
            <Bell className="h-4 w-4" />
          </button>
          
          <div className="ml-2 relative">
            <button 
              className="flex items-center focus:outline-none"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              aria-label="เมนูผู้ใช้"
            >
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                {user?.firstName?.charAt(0) || user?.name?.charAt(0) || "U"}
              </div>
            </button>
            
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName || user?.name || ""} {user?.lastName || ""}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || ""}
                  </p>
                </div>
                
                <Link 
                  href="/dashboard/profile" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    โปรไฟล์
                  </div>
                </Link>
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <div className="flex items-center">
                    <LogOut className="h-4 w-4 mr-2" />
                    ออกจากระบบ
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation tabs */}
      <div className="h-8 sm:h-9 flex items-center px-2 sm:px-4 overflow-x-auto">
        {navTabs.map(tab => {
          const isActive = 
            tab.href === '/dashboard' 
              ? pathname === '/dashboard'
              : pathname?.startsWith(tab.href);
              
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "inline-flex items-center px-2 py-1 border-b-2 text-xs sm:text-sm font-medium h-full mr-2 sm:mr-4 whitespace-nowrap",
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              {tab.text}
            </Link>
          )
        })}
      </div>
    </header>
  )
}