// app/dashboard/map/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { CategoryDoc } from '@prisma/client'
import { DocumentWithCategory } from '@/app/types/document'
import { getCategories } from '@/app/lib/actions/categories/get'
import { getDocuments } from '@/app/lib/actions/documents/get'
import dynamic from 'next/dynamic'
import CircleLoader from './components/CircleLoader'
import MapFooter from './components/MapFooter'
import Link from 'next/link'

// โหลด DynamicMapView แบบ dynamic เพื่อป้องกัน SSR ปัญหา
const DynamicMapView = dynamic(
  () => import('./components/DynamicMapView'),
  { ssr: false }
)

export default function MapPage() {
  const [categories, setCategories] = useState<CategoryDoc[]>([])
  const [documents, setDocuments] = useState<DocumentWithCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [highlightedDocId, setHighlightedDocId] = useState<number | null>(null)

  // โหลดข้อมูลเมื่อเริ่มต้น
  useEffect(() => {
    const loadData = async () => {
      try {
        // โหลดข้อมูลหมวดหมู่และเอกสารพร้อมกัน
        const [catsData, docsData] = await Promise.all([
          getCategories(),
          getDocuments()
        ])
        
        setCategories(catsData)
        
        // เรียงลำดับเอกสารตามวันที่สร้าง (ล่าสุดอยู่บนสุด)
        const sortedDocs = [...docsData].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        
        // เพิ่ม flag และปีเริ่มต้นให้กับเอกสาร
        const docsWithMetadata = sortedDocs.map((doc, index) => ({
          ...doc,
          isLatest: index < 5,
          year: (doc as any).year ?? (new Date().getFullYear() + 543)
        }))
        
        setDocuments(docsWithMetadata)
        
        // เริ่มต้นให้เลือกทุกหมวดหมู่
        setSelectedCategories(catsData.map(c => c.id))
      } catch (error) {
        console.error('Error loading data:', error)
        setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // ฟังก์ชันสลับเลือกหมวดหมู่ทั้งหมด
  const toggleAllCategories = useCallback(() => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(categories.map(c => c.id))
    }
  }, [selectedCategories, categories])

  // ฟังก์ชันสลับเลือกหมวดหมู่เดียว
  const toggleCategory = useCallback((categoryId: number) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }, [])

  // แสดง loading
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <CircleLoader message="กำลังโหลดข้อมูล..." variant="spinner" />
      </div>
    )
  }

  // แสดงข้อผิดพลาด
  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-slate-200 max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    )
  }


  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-gray-50">
      {/* ส่วนแผนที่หลัก - ให้ใช้พื้นที่ส่วนใหญ่ */}
      <div className="flex-1 relative" style={{ zIndex: 1 }}>
        <DynamicMapView
          categories={categories}
          documents={documents.map((doc) => ({
            ...doc,
            isLatest: doc.isLatest || doc.id === highlightedDocId,
            year: doc.year ?? (new Date().getFullYear() + 543)
          }))}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          onHoverDocument={setHighlightedDocId}
        />
      </div>
      
      {/* แถบข้อมูลด้านล่าง - ใช้ MapFooter */}
      <div className="bg-white shadow-md border-t border-gray-200 z-10">
        <MapFooter
          categories={categories}
          documents={documents}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          toggleAllCategories={toggleAllCategories}
          highlightedDocId={highlightedDocId}
          setHighlightedDocId={setHighlightedDocId}
        />
      </div>
    </div>
  )
}