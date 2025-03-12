// app/components/MapClientWrapper.tsx
'use client'

import dynamic from 'next/dynamic'
import { CategoryDoc } from '@prisma/client'
import { DocumentWithCategory } from '@/app/types/document'
import MapSkeleton from './ui/MapSkeleton'
import { useState } from 'react'

// Import component dynamically
const DynamicMapClient = dynamic(
  () => import('../dashboard/map/components/DynamicMapView'),
  {
    ssr: false,
    loading: () => <MapSkeleton />
  }
)

interface MapClientWrapperProps {
  categories: CategoryDoc[];
  documents?: DocumentWithCategory[];
  selectedCategories?: number[];
  setSelectedCategories?: (ids: number[]) => void;
  simplified?: boolean;
  fullscreen?: boolean; // Add fullscreen prop
  showRecentDocuments?: boolean; // เพิ่ม props สำหรับควบคุมการแสดง sidebar
}

export default function MapClientWrapper({ 
  categories, 
  documents, 
  selectedCategories: externalSelectedCategories, 
  setSelectedCategories: externalSetSelectedCategories, 
  simplified = false,
  fullscreen = false, // Default to false
  showRecentDocuments = true // Default to true
}: MapClientWrapperProps) {
  // สร้าง state ภายในสำหรับกรณีที่ไม่มี props จากภายนอก
  const [internalSelectedCategories, setInternalSelectedCategories] = useState<number[]>(
    categories.map(c => c.id)
  );

  // ใช้ค่าจากภายนอกถ้ามี หรือใช้ค่าภายในถ้าไม่มี
  const selectedCategories = externalSelectedCategories !== undefined
    ? externalSelectedCategories
    : internalSelectedCategories;
    
  const setSelectedCategories = externalSetSelectedCategories || setInternalSelectedCategories;

  return (
    <DynamicMapClient 
      categories={categories}
      documents={documents}
      selectedCategories={selectedCategories}
      setSelectedCategories={setSelectedCategories}
      simplified={simplified}
      fullscreen={fullscreen} // Pass fullscreen to DynamicMapView
      showRecentDocuments={showRecentDocuments} // ส่งพารามิเตอร์เพื่อควบคุมการแสดง sidebar
    />
  )
}