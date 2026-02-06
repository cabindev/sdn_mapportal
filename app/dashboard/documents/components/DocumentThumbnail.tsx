// components/DocumentThumbnail.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'

interface DocumentThumbnailProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  aspectRatio?: '16:9' | '1:1' | '4:3'
}

export default function DocumentThumbnail({ 
  src, 
  alt, 
  size = 'sm',
  aspectRatio = '16:9',
  className = '' 
}: DocumentThumbnailProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // สัดส่วน 16:9 สำหรับรูปภาพที่ดูมืออาชีพ
  const sizeClasses = {
    sm: aspectRatio === '16:9' ? 'w-16 h-9' : 'w-12 h-12',
    md: aspectRatio === '16:9' ? 'w-20 h-11' : 'w-16 h-16', 
    lg: aspectRatio === '16:9' ? 'w-24 h-14' : 'w-20 h-20'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div className={`${sizeClasses[size]} rounded-md overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-slate-200/70 shadow-sm relative group ${className}`}>
      {src && !error ? (
        <>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <div className="w-3 h-3 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin"></div>
            </div>
          )}
          <Image
            src={src.startsWith('/') ? src : `/${src}`}
            alt={alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            onLoad={() => setLoading(false)}
            onError={() => {
              setError(true)
              setLoading(false)
            }}
            sizes="(max-width: 768px) 80px, 64px"
          />
          {/* Overlay gradient สำหรับความลึก */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </>
      ) : (
        // Fallback icons with professional styling
        <div className="flex flex-col items-center justify-center text-slate-500">
          {src && error ? (
            // Broken image icon
            <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          ) : (
            // Document icon with professional styling
            <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          )}
        </div>
      )}
    </div>
  )
}