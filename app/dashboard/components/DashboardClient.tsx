'use client'

import { useDashboard } from '../context/DashboardContext'
import Sidebar from './Sidebar'
import TopNav from './TopNav'

interface DashboardClientProps {
  user: any;
  children: React.ReactNode;
}

export default function DashboardClient({ user, children }: DashboardClientProps) {
  const { sidebarCollapsed, isMobileSidebarOpen, toggleMobileSidebar } = useDashboard();

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 transition-opacity lg:hidden"
          onClick={() => toggleMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className={`
        flex-1 min-h-screen flex flex-col transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        <TopNav user={user} />

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
