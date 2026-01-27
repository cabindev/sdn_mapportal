'use client'

import { LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function FloatingDashboardButton() {
  const pathname = usePathname()
  
  // ซ่อนปุ่มถ้าอยู่ในหน้า dashboard อยู่แล้ว
  if (pathname?.startsWith('/dashboard')) {
    return null
  }

  return (
    <Link
      href="/dashboard"
      className="fixed bottom-6 right-20 z-[950] bg-neutral-800 hover:bg-neutral-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
      title="ไปที่ Dashboard"
    >
      <LayoutDashboard className="w-6 h-6" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-neutral-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Dashboard
      </span>
    </Link>
  )
}