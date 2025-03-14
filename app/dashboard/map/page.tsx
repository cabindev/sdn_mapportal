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

const DynamicMapView = dynamic(
  () => import('./components/DynamicMapView'),
  { ssr: false }
)

export default function MapPage() {
  const [categories, setCategories] = useState<CategoryDoc[]>([])
  const [documents, setDocuments] = useState<DocumentWithCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMapLoading, setIsMapLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [highlightedDocId, setHighlightedDocId] = useState<number | null>(null)
  const [recentDocuments, setRecentDocuments] = useState<DocumentWithCategory[]>([])

  // Check if component is mounted
  useEffect(() => {
    setIsMounted(true)
    const timer = setTimeout(() => {
      setIsMapLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // โหลดข้อมูล
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catsData, docsData] = await Promise.all([
          getCategories(),
          getDocuments()
        ])
        
        setCategories(catsData)
        
        const sortedDocs = [...docsData].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        
        const docsWithLatestFlag = sortedDocs.map((doc, index) => ({
          ...doc,
          isLatest: index < 5,
        }))
        
        setDocuments(docsWithLatestFlag)
        setRecentDocuments(sortedDocs.slice(0, 10))
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

  // ฟังก์ชั่นสลับเลือกหมวดหมู่เดียว
  const toggleCategory = useCallback((categoryId: number) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }, [])

  // แสดง loading เฉพาะเมื่อกำลังโหลดข้อมูลเท่านั้น
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <CircleLoader message="กำลังโหลดข้อมูล..." variant="spinner" />
      </div>
    )
  }

  // แสดงข้อผิดพลาด
  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
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

  // แสดงหน้าปกติ
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ส่วนหัวของหน้าแผนที่ - แสดงเฉพาะในหน้าจอกลางและใหญ่ */}
      <div className="hidden md:flex bg-white shadow-sm py-3 px-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-medium text-gray-800">ระบบแผนที่เอกสารติดตามประเทศไทย</h1>
          <span className="text-sm bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
            {documents.length} เอกสาร
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={toggleAllCategories}
            className="text-sm px-3 py-1.5 bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 transition-colors"
          >
            {selectedCategories.length === categories.length ? 'ยกเลิกการเลือกทั้งหมด' : 'เลือกทั้งหมด'}
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/documents/new'}
            className="text-sm px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            + เพิ่มเอกสารใหม่
          </button>
        </div>
      </div>
      
      {/* โครงสร้างหลัก - แผนที่ขยายเต็มพื้นที่ */}
      <div className="flex-1 overflow-hidden relative">
        {isMapLoading && (
          <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-10">
            <CircleLoader message="กำลังโหลดแผนที่..." variant="pulse" />
          </div>
        )}
        
        {isMounted && (
          <DynamicMapView
            categories={categories}
            documents={documents.map((doc) => ({
              ...doc,
              isLatest: doc.isLatest || doc.id === highlightedDocId,
            }))}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            recentDocuments={recentDocuments}
            onHoverDocument={setHighlightedDocId}
            showRecentDocuments={false}
          />
        )}
      </div>

      {/* ส่วนข้อมูลด้านล่าง */}
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
  )
}