// app/dashboard/components/documents/DocumentCard.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DocumentWithCategory } from '@/app/types/document'

interface SerializedDocument extends Omit<DocumentWithCategory, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

interface DocumentCardProps {
  document: SerializedDocument;
  onDelete: () => void;
  isDeleting: boolean;
}

export default function DocumentCard({
  document,
  onDelete,
  isDeleting
}: DocumentCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  
  // Reset loading state when document id changes
  useEffect(() => {
    setIsImageLoaded(false)
    setImageError(false)
  }, [document.id, document.coverImage])
  
  // Force image reloading on DOM render
  useEffect(() => {
    const img = imageRef.current
    if (img && img.complete) {
      setIsImageLoaded(true)
    }
  }, [])
  
  if (!document) {
    return null
  }

  // Create a loading-safe image URL with document ID to bust cache
  const getImageUrl = () => {
    if (!document.coverImage) return null
    
    // Clean up the path and add a query parameter for cache busting
    const cleanPath = document.coverImage.startsWith('/') 
      ? document.coverImage 
      : `/${document.coverImage}`
      
    return `${cleanPath}?v=${document.id}`
  }
  
  const imageUrl = getImageUrl()

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* ปรับส่วนของรูปภาพให้เป็นอัตราส่วน 16:9 */}
      <div className="relative w-full" style={{ paddingTop: "56.25%" }}> {/* 56.25% คือ อัตราส่วน 9/16 = 0.5625 */}
        {!imageUrl ? (
          <div
            className="absolute inset-0 bg-gray-100"
            style={{
              backgroundImage: `url('/cover.svg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        ) : imageError ? (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">ไม่สามารถโหลดรูปภาพได้</span>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-100">
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="animate-pulse flex space-x-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            )}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url('${imageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: isImageLoaded ? 'block' : 'none'
              }}
            ></div>
            <img
              ref={imageRef}
              src={imageUrl}
              alt={document.title || "เอกสาร"}
              className="hidden"
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </div>
        )}
      </div>

      <div className="p-3">
        {/* แยกชื่อเอกสารและหมวดหมู่ให้อยู่คนละบรรทัด */}
        <div>
          <Link 
            href={`/dashboard/documents/${document.id}`}
            className="text-sm font-medium hover:text-orange-600 truncate block"
          >
            {document.title || "ไม่มีชื่อ"}
          </Link>
          
          {document.category && (
            <div className="mt-1">
              <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full inline-block">
                {document.category.name}
              </span>
            </div>
          )}
        </div>

        <div className="mt-2 text-xs text-gray-500">
          <p>{document.province || "-"}</p>
          <div className="flex items-center space-x-2">
            <p>
              {new Date(document.createdAt).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            
            {/* เพิ่มสถานะ "ไม่เผยแพร่" ด้วยตัวสีแดงขนาดเล็ก */}
            {!document.isPublished && (
              <span className="text-xs text-red-500 font-medium">
                ไม่เผยแพร่
              </span>
            )}
          </div>
        </div>

        <div className="mt-2 flex justify-end space-x-1">
          <Link
            href={`/dashboard/documents/${document.id}/edit`}
            className="px-2 py-0.5 text-xs text-orange-600 hover:bg-orange-50 rounded"
          >
            แก้ไข
          </Link>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
          >
            {isDeleting ? 'กำลังลบ...' : 'ลบ'}
          </button>
        </div>
      </div>
    </div>
  )
}