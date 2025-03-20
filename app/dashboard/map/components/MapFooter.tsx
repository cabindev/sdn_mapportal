// components/MapFooter.tsx
'use client'

import { useState, useEffect } from 'react'
import { CategoryDoc } from '@prisma/client'
import { DocumentWithCategory } from '@/app/types/document'
import MapHeader from './MapHeader'
import MapTabNavigation from './MapTabNavigation'
import CategoriesTab from './CategoriesTab'
import LegendTab from './LegendTab'
import StatsTab from './StatsTab'
import DocumentsTab from './DocumentsTab'


interface MapFooterProps {
  categories: CategoryDoc[]
  documents: DocumentWithCategory[]
  selectedCategories: number[]
  toggleCategory: (categoryId: number) => void
  toggleAllCategories: () => void
  highlightedDocId: number | null
  setHighlightedDocId: (id: number | null) => void
}

export default function MapFooter({
  categories,
  documents,
  selectedCategories,
  toggleCategory,
  toggleAllCategories,
  highlightedDocId,
  setHighlightedDocId
}: MapFooterProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'legend' | 'stats' | 'docs'>('categories')
  // เราไม่ใช้ isCollapsed อีกต่อไปเพราะจะลบปุ่มนี้ออก
  // const [isCollapsed, setIsCollapsed] = useState(false)
  const [newDocuments, setNewDocuments] = useState(0)
  
  // คำนวณจำนวนเอกสารใหม่ (7 วันล่าสุด)
  useEffect(() => {
    const latestDocs = documents
      .filter(doc => new Date(doc.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .length
    
    setNewDocuments(latestDocs)
  }, [documents])
  
  // กรองเอกสารตามหมวดหมู่ที่เลือก
  const filteredDocuments = documents.filter(doc => 
    selectedCategories.length === 0 || selectedCategories.includes(doc.categoryId)
  )

  // เรียงลำดับเอกสารให้ล่าสุดอยู่บนสุด
  const sortedDocuments = [...filteredDocuments].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  
  // ใน components/MapFooter.tsx

// ในส่วน return ของคอมโพเนนต์
return (
  <div className="bg-white border-t border-slate-200 flex flex-col h-full overflow-hidden">
    {/* ส่วนหัว - ให้มีความสูงคงที่ */}
    <div className="flex-shrink-0">
      <MapHeader 
        documentsCount={documents.length}
        filteredCount={filteredDocuments.length}
        toggleAllCategories={toggleAllCategories}
        selectedCategories={selectedCategories}
        categoriesCount={categories.length}
      />
    </div>

    {/* แท็บนำทาง - ให้มีความสูงคงที่ */}
    <div className="flex-shrink-0">
      <MapTabNavigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        newDocuments={newDocuments}
      />
    </div>

    {/* เนื้อหาตามแท็บ - ให้ขยายพื้นที่ตามที่มี และมี scrollbar เมื่อเนื้อหาเกิน */}
    <div className="flex-1 overflow-y-auto bg-white">
      {activeTab === "categories" && (
        <CategoriesTab 
          categories={categories}
          documents={documents}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
        />
      )}

      {activeTab === "legend" && <LegendTab categories={categories} />}

      {activeTab === "stats" && (
        <StatsTab 
          categories={categories}
          documents={documents}
        />
      )}

      {activeTab === "docs" && (
        <DocumentsTab 
          documents={sortedDocuments}
          categories={categories}
          setHighlightedDocId={setHighlightedDocId}
          toggleAllCategories={toggleAllCategories}
        />
      )}
    </div>
  </div>
)
}