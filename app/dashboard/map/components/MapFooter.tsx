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
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'

interface MapFooterProps {
  categories: CategoryDoc[]
  documents: DocumentWithCategory[]
  selectedCategories: number[]
  toggleCategory: (categoryId: number) => void
  toggleAllCategories: () => void
  highlightedDocId: number | null
  setHighlightedDocId: (id: number | null) => void
  // ลบ onSearch และ onAddNewDocument
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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [newDocuments, setNewDocuments] = useState(0)
  
  // จำลองการมีเอกสารใหม่
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
  
  return (
    <div className={`bg-white border-t border-slate-200 flex-shrink-0 z-20 shadow-md transition-all duration-300 ${isCollapsed ? 'h-[42px]' : ''}`}>
      {/* ปุ่มยุบ/ขยาย */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-t-lg border border-slate-200 border-b-0 px-4 py-1 shadow-sm text-slate-500 hover:text-orange-500 z-10"
      >
        {isCollapsed ? (
          <><FiChevronUp className="inline mr-1" /> แสดงรายละเอียด</>
        ) : (
          <><FiChevronDown className="inline mr-1" /> ซ่อนรายละเอียด</>
        )}
      </button>
      
      {/* ส่วนหัว */}
      <MapHeader 
        documentsCount={documents.length}
        filteredCount={filteredDocuments.length}
        toggleAllCategories={toggleAllCategories}
        selectedCategories={selectedCategories}
        categoriesCount={categories.length}
        // ลบ onSearch และ onAddNewDocument
      />

      {/* แท็บนำทาง & เนื้อหา (ซ่อนเมื่อยุบ) */}
      {!isCollapsed && (
        <>
          <MapTabNavigation 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            newDocuments={newDocuments}
          />

          {/* เนื้อหาตามแท็บ */}
          <div className="overflow-y-auto bg-white" style={{ maxHeight: "300px" }}>
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
        </>
      )}
    </div>
  )
}