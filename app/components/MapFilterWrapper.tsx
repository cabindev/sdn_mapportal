// app/components/MapFilterWrapper.tsx
'use client'

import { useState, useEffect } from 'react'
import { CategoryDoc } from '@prisma/client'
import { DocumentWithCategory } from '@/app/types/document'
import { getCategoryColor } from '@/app/utils/colorGenerator'
import { FiFilter, FiMap } from 'react-icons/fi'
import dynamic from 'next/dynamic'

// Fix paths to look in dashboard/map/components instead
const CircleLoader = dynamic(() => import('@/app/dashboard/map/components/CircleLoader'))
const DynamicMapView = dynamic(
  () => import('@/app/dashboard/map/components/DynamicMapView'),
  { 
    ssr: false, 
    loading: () => <div className="h-[700px] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-sm text-gray-600">กำลังโหลดแผนที่...</p>
      </div>
    </div>
  }
)

interface MapFilterWrapperProps {
  categories: CategoryDoc[]
  documents: DocumentWithCategory[]
}

export default function MapFilterWrapper({ categories, documents }: MapFilterWrapperProps) {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [expanded, setExpanded] = useState(false)
  
  // ตั้งค่าเริ่มต้นให้เลือกทุกหมวดหมู่
  useEffect(() => {
    setSelectedCategories(categories.map(c => c.id))
  }, [categories])
  
  // ฟังก์ชั่นสลับเลือกหมวดหมู่ทั้งหมด
  const toggleAllCategories = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(categories.map(c => c.id))
    }
  }
  
  // ฟังก์ชั่นสลับเลือกหมวดหมู่เดียว
  const toggleCategory = (categoryId: number) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId]
    
    setSelectedCategories(newSelected)
  }
  
  return (
    <>
      {/* ส่วนหัวตัวกรอง */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FiMap className="text-orange-500 mr-1 text-xl" />
          <h2 className="text-lg font-bold text-slate-800">แผนที่เอกสารดิจิทัล</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            แสดง {selectedCategories.length === 0 ? 0 : documents.filter(doc => 
              selectedCategories.includes(doc.categoryId)
            ).length} จาก {documents.length} เอกสารที่เผยแพร่
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm px-3 py-1.5 bg-white hover:bg-orange-50 text-orange-600 rounded-md transition-colors flex items-center border border-orange-200"
          >
            <FiFilter className="mr-1.5" />
            {expanded ? "ซ่อนตัวกรอง" : "แสดงตัวกรอง"}
          </button>
        </div>
      </div>
      
      {/* ส่วนตัวกรอง (แสดงเมื่อกดเปิด) */}
      {expanded && (
        <div className="py-3 px-4 bg-gray-50 border-b border-gray-200">
          <div className="mb-2 flex justify-between items-center">
            <h3 className="font-medium text-sm text-gray-700">กรองตามประเภทเอกสารที่เผยแพร่</h3>
            <button
              onClick={toggleAllCategories}
              className="text-xs px-2 py-1 hover:bg-gray-200 text-gray-600 rounded transition-colors"
            >
              {selectedCategories.length === categories.length ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {categories.map((cat) => {
              const colorScheme = getCategoryColor(cat.id);
              const isSelected = selectedCategories.includes(cat.id);
              const count = documents.filter(d => d.categoryId === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`py-1.5 px-3 text-sm rounded transition-all flex items-center ${
                    isSelected
                      ? "bg-slate-800 text-white shadow-sm"
                      : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full mr-1.5 flex-shrink-0"
                    style={{ backgroundColor: colorScheme.primary }}
                  ></span>
                  <span className="truncate">{cat.name}</span>
                  <span className="ml-1.5 text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* แผนที่ */}
      <div className="h-[700px]">
        <DynamicMapView 
          categories={categories} 
          documents={documents}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          simplified={true} 
          fullscreen={true}
          showRecentDocuments={true}
        />
      </div>
    </>
  );
}