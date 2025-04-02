// app/components/MapClientWrapper.tsx
'use client'

import dynamic from 'next/dynamic'
import { CategoryDoc } from '@prisma/client'
import { DocumentWithCategory } from '@/app/types/document'
import MapSkeleton from './ui/MapSkeleton'
import { useState, useMemo } from 'react'

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
  fullscreen?: boolean;
  showRecentDocuments?: boolean;
  showUnpublished?: boolean;
  mapHeight?: string; // เพิ่ม prop สำหรับกำหนดความสูงของแผนที่
  mapWidth?: string;  // เพิ่ม prop สำหรับกำหนดความกว้างของแผนที่
}

export default function MapClientWrapper({ 
  categories, 
  documents = [], 
  selectedCategories: externalSelectedCategories, 
  setSelectedCategories: externalSetSelectedCategories, 
  simplified = false,
  fullscreen = false,
  showRecentDocuments = true,
  showUnpublished = false,
  mapHeight = 'h-[85vh]', // ค่าเริ่มต้นที่สูงขึ้น
  mapWidth = 'w-full'     // ค่าเริ่มต้นแบบเต็มความกว้าง
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

  // กรองเอกสารที่ไม่เผยแพร่ออกถ้า showUnpublished เป็น false
  const filteredDocuments = useMemo(() => {
    if (showUnpublished) {
      return documents;
    }
    return documents.filter(doc => doc.isPublished);
  }, [documents, showUnpublished]);

  // เตรียมข้อมูลเอกสารล่าสุดสำหรับ sidebar (ใช้เฉพาะเอกสารที่ผ่านการกรองแล้ว)
  const recentDocuments = useMemo(() => {
    if (!showRecentDocuments) return [];
    
    return [...filteredDocuments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [filteredDocuments, showRecentDocuments]);

  return (
    <div className={`${mapWidth} ${mapHeight}`}>
      <DynamicMapClient 
        categories={categories}
        documents={filteredDocuments}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        simplified={simplified}
        fullscreen={fullscreen}
        showRecentDocuments={showRecentDocuments}
        recentDocuments={recentDocuments}
      />
    </div>
  )
}