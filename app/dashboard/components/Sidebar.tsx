'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useDashboard } from '../context/DashboardContext'
import {
  LayoutDashboard,
  Map,
  FileText,
  Tag,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Users,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'

interface SidebarProps {
  user: any
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const {
    sidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    toggleMobileSidebar,
  } = useDashboard()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    if (pathname?.startsWith('/dashboard/settings')) setIsSettingsOpen(true)
  }, [pathname])

  // ปิด sidebar เมื่อคลิกเมนู (เฉพาะ mobile)
  const handleMenuClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      toggleMobileSidebar(false)
    }
  }

  const mainMenuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'ภาพรวมระบบ',
    },
    {
      name: 'Maps',
      href: '/dashboard/map',
      icon: Map,
      description: 'แผนที่เอกสาร',
    },
    {
      name: 'Documents',
      href: '/dashboard/documents',
      icon: FileText,
      description: 'จัดการเอกสาร',
    },
    {
      name: 'Categories',
      href: '/dashboard/categories',
      icon: Tag,
      description: 'หมวดหมู่เอกสาร',
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: User,
      description: 'ข้อมูลส่วนตัว',
    },
  ]

  const settingsMenu = {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'ตั้งค่าระบบ',
    subMenus: [
      {
        name: 'Edit Profile',
        href: '/dashboard/settings/profile',
        icon: User,
        requireAdmin: false,
        description: 'แก้ไขข้อมูลส่วนตัว',
      },
      {
        name: 'Manage Users',
        href: '/dashboard/settings/users',
        icon: Users,
        requireAdmin: true,
        description: 'จัดการผู้ใช้งาน',
      },
    ],
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 bg-white/90 backdrop-blur border-r border-neutral-200 transition-all duration-300 shadow-lg
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
        {!sidebarCollapsed ? (
          <Link href="/dashboard" className="flex items-center space-x-2" onClick={handleMenuClick}>
            <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SDN</span>
            </div>
            <span className="font-semibold text-neutral-900">Map Portal</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto" onClick={handleMenuClick}>
            <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SDN</span>
            </div>
          </Link>
        )}

        {/* Mobile close button */}
        <button
          onClick={() => toggleMobileSidebar(false)}
          className="lg:hidden p-2 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Desktop collapse */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:block p-2 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200"
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {mainMenuItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleMenuClick}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition
                  ${isActive
                    ? 'bg-neutral-900/5 text-neutral-900 border-r-2 border-neutral-900'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
                title={sidebarCollapsed ? item.name : ''}
              >
                <Icon className={`flex-shrink-0 ${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                {!sidebarCollapsed && (
                  <div className="ml-3">
                    <div>{item.name}</div>
                    <div className="text-xs text-neutral-400">{item.description}</div>
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Settings */}
        <div className="mt-8">
          {!sidebarCollapsed && (
            <div className="px-3 mb-2">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                System
              </h3>
            </div>
          )}
          <div className="px-3">
            {/* Settings main button */}
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`
                group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition
                ${pathname?.startsWith('/dashboard/settings')
                  ? 'bg-neutral-900/5 text-neutral-900 border-r-2 border-neutral-900'
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                }
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              title={sidebarCollapsed ? settingsMenu.name : ''}
            >
              <Settings className={`flex-shrink-0 ${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
              {!sidebarCollapsed && (
                <>
                  <div className="ml-3 flex-1 text-left">
                    <div>{settingsMenu.name}</div>
                    <div className="text-xs text-neutral-400">{settingsMenu.description}</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
            {/* Expanded */}
            {!sidebarCollapsed && isSettingsOpen && (
              <div className="mt-1 ml-8 space-y-1">
                {settingsMenu.subMenus.map((subMenu) => {
                  if (subMenu.requireAdmin && !isAdmin) return null
                  const Icon = subMenu.icon
                  const isSubActive = pathname === subMenu.href
                  return (
                    <Link
                      key={subMenu.href}
                      href={subMenu.href}
                      onClick={handleMenuClick}
                      className={`
                        group flex items-center px-3 py-2 text-sm rounded-lg transition
                        ${isSubActive
                          ? 'bg-neutral-200 text-neutral-900'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <div className="ml-3">
                        <div>{subMenu.name}</div>
                        <div className="text-xs text-neutral-400">{subMenu.description}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
            {/* Collapsed */}
            {sidebarCollapsed && (
              <div className="mt-1 space-y-1">
                {settingsMenu.subMenus.map((subMenu) => {
                  if (subMenu.requireAdmin && !isAdmin) return null
                  const Icon = subMenu.icon
                  const isSubActive = pathname === subMenu.href
                  return (
                    <Link
                      key={subMenu.href}
                      href={subMenu.href}
                      onClick={handleMenuClick}
                      className={`
                        flex justify-center p-2 rounded-lg transition
                        ${isSubActive
                          ? 'bg-neutral-200 text-neutral-900'
                          : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900'
                        }
                      `}
                      title={subMenu.name}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Section */}
      <div className="border-t border-neutral-200 p-4">
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-neutral-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-neutral-700">
              {user?.firstName?.charAt(0) || user?.name?.charAt(0) || "U"}
            </span>
          </div>
          {!sidebarCollapsed && (
            <div className="ml-3 flex-1 min-w-0">
              <div className="text-sm font-medium text-neutral-900 truncate">
                {user?.firstName || user?.name || ""} {user?.lastName || ""}
              </div>
              <div className="text-xs text-neutral-400 truncate">{user?.email || ""}</div>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={`
            mt-3 flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-200 rounded-lg transition
            ${sidebarCollapsed ? 'justify-center' : ''}
          `}
          title={sidebarCollapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="ml-3">ออกจากระบบ</span>}
        </button>
      </div>
    </aside>
  )
}
