// app/dashboard/Sidebar.tsx
'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { 
  HomeIcon, 
  DocumentTextIcon,
  MapIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  TagIcon,
  Cog6ToothIcon,
  UsersIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';

const mainMenuItems = [
  {
    name: 'หน้าหลัก',
    href: '/dashboard',
    icon: HomeIcon
  },
  {
    name: 'แผนที่',
    href: '/dashboard/map',
    icon: MapIcon
  },
  {
    name: 'จัดการเอกสาร',
    href: '/dashboard/documents',
    icon: DocumentTextIcon
  },
  {
    name: 'ประเภทเอกสาร',
    href: '/dashboard/categories',
    icon: TagIcon
  },
  {
    name: 'ข้อมูลส่วนตัว',
    href: '/dashboard/profile',
    icon: UserIcon
  }
];

// ระบบตั้งค่าและเมนูย่อย
const settingsMenu = {
  name: 'ตั้งค่า',
  href: '/dashboard/settings',
  icon: Cog6ToothIcon,
  subMenus: [
    {
      name: 'จัดการผู้ใช้',
      href: '/dashboard/settings/users',
      icon: UsersIcon,
      requireAdmin: true
    }
    // สามารถเพิ่มเมนูย่อยอื่นๆ ได้ตรงนี้
  ]
};

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  // เช็คเส้นทางเมื่อเปลี่ยนหน้าและเปิดเมนูย่อยอัตโนมัติถ้าอยู่ในส่วนตั้งค่า
  useEffect(() => {
    if (pathname?.startsWith('/dashboard/settings')) {
      setIsSettingsOpen(true);
    }
  }, [pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // ตรวจสอบว่าอยู่ในหน้าตั้งค่าหรือไม่
  const isInSettingsPage = pathname?.startsWith('/dashboard/settings');

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-gray-800 text-white"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar for Desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-30 transform lg:translate-x-0 transition duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:flex lg:w-64 text-white bg-gray-900 min-h-screen flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-orange-500">SDN</span>
            <span className="ml-2 text-white">Map Portal</span>
          </Link>
          <button 
            onClick={toggleMobileMenu}
            className="lg:hidden text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {/* เมนูหลัก */}
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-orange-600 text-white' 
                        : 'hover:bg-gray-800'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}

            {/* เมนูตั้งค่า */}
            <li>
              <button
                onClick={toggleSettings}
                className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
                  isInSettingsPage 
                    ? 'bg-orange-600 text-white' 
                    : 'hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <settingsMenu.icon className="w-5 h-5" />
                  <span>{settingsMenu.name}</span>
                </div>
                <ChevronDownIcon 
                  className={`w-4 h-4 transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* เมนูย่อยของตั้งค่า */}
              <div 
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${isSettingsOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}
                `}
              >
                <ul className="bg-gray-800 rounded-lg ml-2 mr-2 overflow-hidden">
                  {settingsMenu.subMenus.map((subMenu) => {
                    // ตรวจสอบสิทธิ์ก่อนแสดงเมนู
                    if (subMenu.requireAdmin && !isAdmin) {
                      return null;
                    }

                    const Icon = subMenu.icon;
                    const isSubActive = pathname === subMenu.href;
                    
                    return (
                      <li key={subMenu.href}>
                        <Link
                          href={subMenu.href}
                          className={`flex items-center space-x-3 p-3 transition-colors ${
                            isSubActive 
                              ? 'bg-orange-500 text-white' 
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{subMenu.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-800 transition-colors text-orange-100 hover:text-white"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
}