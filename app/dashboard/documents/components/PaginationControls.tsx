// components/PaginationControls.tsx
'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalDocuments: number
  itemsPerPage: number
  // ลบ getPageUrl ออก และไม่ส่งฟังก์ชันมาจาก Server Component
}

export default function PaginationControls({ 
  currentPage, 
  totalPages, 
  totalDocuments, 
  itemsPerPage
}: PaginationControlsProps) {
  const searchParams = useSearchParams()
  
  // สร้างฟังก์ชัน getPageUrl ภายใน Client Component
  const getPageUrl = (page: number): string => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `?${params.toString()}`
  }

  const skip = (currentPage - 1) * itemsPerPage
  const hasPrevPage = currentPage > 1
  const hasNextPage = currentPage < totalPages

  // สร้างหมายเลขหน้าที่จะแสดง
  const generatePageNumbers = () => {
    const maxVisible = 5
    const pages: (number | string)[] = []
    
    if (totalPages <= maxVisible) {
      // แสดงทุกหน้าถ้าจำนวนน้อย
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // แสดงหน้าแรกเสมอ
      pages.push(1)
      
      if (currentPage <= 3) {
        // แสดงหน้า 2, 3, 4, ..., สุดท้าย
        for (let i = 2; i <= Math.min(4, totalPages - 1); i++) {
          pages.push(i)
        }
        if (totalPages > 4) {
          pages.push('...')
          pages.push(totalPages)
        }
      } else if (currentPage >= totalPages - 2) {
        // แสดง 1, ..., สุดท้าย-2, สุดท้าย-1, สุดท้าย
        pages.push('...')
        for (let i = Math.max(2, totalPages - 2); i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // แสดง 1, ..., ปัจจุบัน-1, ปัจจุบัน, ปัจจุบัน+1, ..., สุดท้าย
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-slate-50/30 border-t border-slate-200/50">
      {/* ข้อมูลการแสดงผล */}
      <div className="hidden sm:block text-xs font-light text-slate-700">
        แสดง <span className="font-medium">{skip + 1}</span> ถึง{' '}
        <span className="font-medium">{Math.min(skip + itemsPerPage, totalDocuments)}</span> จาก{' '}
        <span className="font-medium">{totalDocuments}</span> รายการ
      </div>
      
      {/* Mobile: แสดงเฉพาะหน้าปัจจุบัน */}
      <div className="sm:hidden text-xs font-light text-slate-700">
        หน้า {currentPage} จาก {totalPages}
      </div>
      
      {/* Controls */}
      <div className="flex items-center space-x-1">
        {/* ปุ่มย้อนกลับ */}
        {hasPrevPage ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-light text-slate-700 hover:text-slate-900 hover:bg-white/80 rounded-md transition-all duration-200 border border-transparent hover:border-slate-200"
          >
            <ChevronLeftIcon className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">ก่อนหน้า</span>
          </Link>
        ) : (
          <span className="inline-flex items-center px-3 py-1.5 text-xs font-light text-slate-400 cursor-not-allowed">
            <ChevronLeftIcon className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">ก่อนหน้า</span>
          </span>
        )}
        
        {/* หมายเลขหน้า */}
        <div className="hidden sm:flex items-center space-x-1">
          {generatePageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span 
                  key={`ellipsis-${index}`}
                  className="inline-flex items-center px-2 py-1 text-xs font-light text-slate-400"
                >
                  ...
                </span>
              )
            }
            
            const pageNumber = page as number
            const isCurrentPage = pageNumber === currentPage
            
            return (
              <Link
                key={pageNumber}
                href={getPageUrl(pageNumber)}
                className={`inline-flex items-center px-2.5 py-1.5 text-xs font-light rounded-md transition-all duration-200 ${
                  isCurrentPage
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 border border-transparent hover:border-slate-200'
                }`}
              >
                {pageNumber}
              </Link>
            )
          })}
        </div>
        
        {/* Mobile: แสดงเฉพาะหน้าปัจจุบัน */}
        <div className="sm:hidden">
          <span className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-md">
            {currentPage}
          </span>
        </div>
        
        {/* ปุ่มถัดไป */}
        {hasNextPage ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-light text-slate-700 hover:text-slate-900 hover:bg-white/80 rounded-md transition-all duration-200 border border-transparent hover:border-slate-200"
          >
            <span className="hidden sm:inline">ถัดไป</span>
            <ChevronRightIcon className="w-3 h-3 ml-1" />
          </Link>
        ) : (
          <span className="inline-flex items-center px-3 py-1.5 text-xs font-light text-slate-400 cursor-not-allowed">
            <span className="hidden sm:inline">ถัดไป</span>
            <ChevronRightIcon className="w-3 h-3 ml-1" />
          </span>
        )}
      </div>
    </div>
  )
}