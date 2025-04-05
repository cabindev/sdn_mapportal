// app/dashboard/components/Sidebar.tsx
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useDashboard } from '../context/DashboardContext';
import { cn } from "../../lib/utils";
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
  PanelLeft,
  X
} from 'lucide-react';

interface SidebarProps {
  user: any;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, isMobileSidebarOpen, toggleMobileSidebar } = useDashboard();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // เปิดเมนูตั้งค่าอัตโนมัติถ้าอยู่ในหน้าตั้งค่า
  useEffect(() => {
    if (pathname?.startsWith('/dashboard/settings')) {
      setIsSettingsOpen(true);
    }
  }, [pathname]);

  // ปิด sidebar บนมือถือเมื่อเปลี่ยนหน้า
  useEffect(() => {
    if (isMobileSidebarOpen) {
      toggleMobileSidebar(false);
    }
  }, [pathname, toggleMobileSidebar, isMobileSidebarOpen]);

  const mainMenuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Maps',
      href: '/dashboard/map',
      icon: Map
    },
    {
      name: 'Documents',
      href: '/dashboard/documents',
      icon: FileText
    },
    {
      name: 'Categories',
      href: '/dashboard/categories',
      icon: Tag
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: User
    }
  ];
  
  const settingsMenu = {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    subMenus: [
      {
        name: 'Edit Profile',
        href: '/dashboard/settings/profile',
        icon: User,
        requireAdmin: false
      },
      {
        name: 'Manage Users',
        href: '/dashboard/settings/users',
        icon: Users,
        requireAdmin: true
      }
    ]
  };
  
  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      {/* Overlay สำหรับกดปิด sidebar บนมือถือ */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
          onClick={() => toggleMobileSidebar(false)}
          aria-hidden="true"
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-gray-900 text-white transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64",
        // ซ่อน sidebar บนมือถือและแสดงเมื่อเปิดเท่านั้น
        "lg:translate-x-0",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar header */}
        <div className="flex h-12 items-center justify-between border-b border-gray-800 px-3">
          {!sidebarCollapsed ? (
            <Link href="/dashboard" className="flex items-center">
              <span className="text-lg font-bold text-orange-500">SDN</span>
              <span className="ml-2 text-white text-sm">Map Portal</span>
            </Link>
          ) : (
            <Link href="/dashboard" className="mx-auto">
              <div className="h-7 w-7 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">SDN</span>
              </div>
            </Link>
          )}
          
          {/* ปุ่มปิดบนมือถือ */}
          <button 
            onClick={() => toggleMobileSidebar(false)}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 lg:hidden"
            aria-label="ปิดเมนู"
          >
            <X className="h-4 w-4" />
          </button>
          
          {/* ปุ่มย่อ/ขยายบนจอใหญ่ */}
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 hidden lg:block"
            aria-label={sidebarCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
          >
            {sidebarCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {/* Sidebar menu */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-orange-600 text-white" 
                      : "hover:bg-gray-800 text-gray-300 hover:text-white",
                    sidebarCollapsed ? "justify-center" : "space-x-3"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-8">
            {!sidebarCollapsed && (
              <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                System
              </h3>
            )}
            
            {/* Settings menu */}
            <div className="px-2">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={cn(
                  "flex items-center w-full p-3 rounded-lg transition-all duration-200",
                  pathname?.startsWith('/dashboard/settings')
                    ? "bg-orange-600 text-white" 
                    : "hover:bg-gray-800 text-gray-300 hover:text-white",
                  sidebarCollapsed && "justify-center"
                )}
                aria-label="เมนูตั้งค่า"
                aria-expanded={isSettingsOpen}
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full ml-3">
                    <span>{settingsMenu.name}</span>
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`} 
                    />
                  </div>
                )}
              </button>
              
              {/* Settings submenu */}
              {!sidebarCollapsed && (
                <div 
                  className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${isSettingsOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}
                  `}
                >
                  <ul className="bg-gray-800 rounded-lg ml-2 mr-2 overflow-hidden">
                    {settingsMenu.subMenus.map((subMenu) => {
                      // Check permissions before showing menu
                      if (subMenu.requireAdmin && !isAdmin) {
                        return null;
                      }
                      
                      const Icon = subMenu.icon;
                      const isSubActive = pathname === subMenu.href;
                      
                      return (
                        <li key={subMenu.href}>
                          <Link
                            href={subMenu.href}
                            className={`flex items-center space-x-3 p-3 transition-all duration-200 ${
                              isSubActive 
                                ? 'bg-orange-500 text-white' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{subMenu.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* User info & logout */}
        <div className="border-t border-gray-800 p-4">
          <div className={cn(
            "flex items-center",
            sidebarCollapsed && "justify-center"
          )}>
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.firstName?.charAt(0) || user?.name?.charAt(0) || "U"}
                </span>
              </div>
            </div>
            {!sidebarCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.firstName || user?.name || ""} {user?.lastName || ""}</p>
                <p className="text-xs text-gray-400">{user?.email || ""}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={cn(
              "mt-4 flex items-center p-3 rounded-lg w-full text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200",
              sidebarCollapsed && "justify-center"
            )}
            aria-label="ออกจากระบบ"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}