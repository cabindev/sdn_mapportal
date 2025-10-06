// components/DocumentTable.tsx
'use client'

import Link from 'next/link'
import { useState, useOptimistic } from 'react'
import { deleteDocument } from '@/app/lib/actions/documents/delete'
import Image from 'next/image'

// Flexible type ที่รองรับข้อมูลจาก searchDocuments
interface DocumentItem {
  id: number
  title: string
  description?: string | null
  isPublished: boolean
  createdAt: string
  coverImage?: string | null
  category?: {
    id?: number
    name: string
    [key: string]: any
  } | null
  user?: {
    id: number
    firstName: string
    lastName: string
    email: string
    role: string
  } | null
  [key: string]: any // เพิ่ม flexibility สำหรับ fields อื่นๆ
}

interface DocumentTableProps {
  documents: DocumentItem[]
}

// Component สำหรับรูปภาพ
function DocumentImage({ src, alt, className = "" }: { src?: string | null, alt: string, className?: string }) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  if (!src) {
    return (
      <div className={`relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-md overflow-hidden border border-slate-200/70 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-md overflow-hidden border border-slate-200/70 ${className}`}>
      {!error ? (
        <>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin"></div>
            </div>
          )}
          <Image
            src={src.startsWith('/') ? src : `/${src}`}
            alt={alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onLoad={() => setLoading(false)}
            onError={() => {
              setError(true)
              setLoading(false)
            }}
            sizes="(max-width: 768px) 80px, 64px"
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </div>
      )}
    </div>
  )
}

export default function DocumentTable({ documents }: DocumentTableProps) {
  const [optimisticDocs, removeOptimistically] = useOptimistic(
    documents,
    (state, deletedId: number) => state.filter(doc => doc.id !== deletedId)
  )
  
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (formData: FormData) => {
    const id = formData.get('id') as string
    const numId = parseInt(id, 10)
    
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบเอกสารนี้?')) {
      return
    }

    setDeletingId(numId)
    removeOptimistically(numId)
    
    try {
      const result = await deleteDocument(id)
      if (!result.success) {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการลบเอกสาร')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบเอกสาร'
      alert(errorMessage)
      window.location.reload()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop/Tablet View */}
      <div className="hidden sm:block">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/70 border-b border-slate-200/50">
          <div className="col-span-2 text-xs font-semibold text-slate-700 uppercase tracking-wide">
            รูปภาพ
          </div>
          <div className="col-span-3 text-xs font-semibold text-slate-700 uppercase tracking-wide">
            ชื่อเอกสาร
          </div>
          <div className="col-span-2 text-xs font-semibold text-slate-700 uppercase tracking-wide">
            ประเภท
          </div>
          <div className="col-span-2 text-xs font-semibold text-slate-700 uppercase tracking-wide">
            ผู้อัปโหลด
          </div>
          <div className="col-span-1 text-xs font-semibold text-slate-700 uppercase tracking-wide">
            สถานะ
          </div>
          <div className="col-span-2 text-xs font-semibold text-slate-700 uppercase tracking-wide">
            วันที่/การจัดการ
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-200/30">
          {optimisticDocs.map((doc) => (
            <div 
              key={doc.id}
              className={`grid grid-cols-12 gap-4 px-6 py-4 group transition-all duration-200 ${
                deletingId === doc.id 
                  ? 'bg-red-50/50 opacity-60' 
                  : 'hover:bg-slate-50/50'
              }`}
            >
              {/* รูปภาพ */}
              <div className="col-span-2">
                <DocumentImage 
                  src={doc.coverImage}
                  alt={doc.title}
                  className="w-16 h-9 group-hover:shadow-sm transition-shadow"
                />
              </div>

              {/* ชื่อเอกสาร */}
              <div className="col-span-3 min-w-0">
                <Link 
                  href={`/dashboard/documents/${doc.id}`}
                  className="block group/link"
                >
                  <h3 className="font-semibold text-slate-900 text-sm group-hover/link:text-slate-700 transition-colors line-clamp-1">
                    {doc.title}
                  </h3>
                </Link>
                {doc.description && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {doc.description}
                  </p>
                )}
              </div>

              {/* ประเภท */}
              <div className="col-span-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/50">
                  {doc.category?.name || 'ไม่ระบุ'}
                </span>
              </div>

              {/* ผู้อัปโหลด */}
              <div className="col-span-2 min-w-0">
                <div className="text-xs text-slate-900 font-medium line-clamp-1">
                  {doc.user ? `${doc.user.firstName} ${doc.user.lastName}` : 'ไม่ระบุ'}
                </div>
                {doc.user && (
                  <div className="text-xs text-slate-600 mt-0.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                      doc.user.role === 'ADMIN' 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {doc.user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}
                    </span>
                  </div>
                )}
              </div>

              {/* สถานะ */}
              <div className="col-span-1">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                  doc.isPublished 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' 
                    : 'bg-amber-50 text-amber-700 border-amber-200/50'
                }`}>
                  {doc.isPublished ? 'เผยแพร่' : 'ไม่เผยแพร่'}
                </span>
              </div>

              {/* วันที่และการจัดการ */}
              <div className="col-span-2 space-y-1">
                <div className="text-xs text-slate-600">
                  {new Date(doc.createdAt).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/dashboard/documents/edit/${doc.id}`}
                    className="text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
                  >
                    แก้ไข
                  </Link>
                  <form action={handleDelete} className="inline">
                    <input type="hidden" name="id" value={doc.id} />
                    <button
                      type="submit"
                      disabled={deletingId === doc.id}
                      className="text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                    >
                      {deletingId === doc.id ? 'ลบ...' : 'ลบ'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden space-y-3 p-4">
        {optimisticDocs.map((doc) => (
          <div 
            key={doc.id}
            className={`bg-white rounded-lg border border-slate-200/50 p-4 transition-all duration-200 ${
              deletingId === doc.id 
                ? 'bg-red-50/50 opacity-60 scale-[0.98]' 
                : 'hover:shadow-sm hover:border-slate-300/50'
            }`}
          >
            <div className="flex space-x-3">
              {/* รูปภาพ Mobile */}
              <div className="flex-shrink-0">
                <DocumentImage 
                  src={doc.coverImage}
                  alt={doc.title}
                  className="w-20 h-11"
                />
              </div>

              {/* เนื้อหา */}
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/dashboard/documents/${doc.id}`}
                  className="block"
                >
                  <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 hover:text-slate-700 transition-colors">
                    {doc.title}
                  </h3>
                </Link>
                
                {doc.description && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {doc.description}
                  </p>
                )}

                {/* Meta tags */}
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                    {doc.category?.name || 'ไม่ระบุ'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    doc.isPublished 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {doc.isPublished ? 'เผยแพร่' : 'ไม่เผยแพร่'}
                  </span>
                  {doc.user && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      doc.user.role === 'ADMIN' 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {doc.user.firstName} {doc.user.lastName}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-500">
                    {new Date(doc.createdAt).toLocaleDateString('th-TH')}
                  </span>
                  
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/dashboard/documents/${doc.id}/edit`}
                      className="text-xs font-medium text-slate-600 hover:text-slate-800"
                    >
                      แก้ไข
                    </Link>
                    <form action={handleDelete} className="inline">
                      <input type="hidden" name="id" value={doc.id} />
                      <button
                        type="submit"
                        disabled={deletingId === doc.id}
                        className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {deletingId === doc.id ? 'ลบ...' : 'ลบ'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {optimisticDocs.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <p className="text-slate-500 font-normal text-sm">ไม่มีเอกสารแสดง</p>
        </div>
      )}
    </div>
  )
}