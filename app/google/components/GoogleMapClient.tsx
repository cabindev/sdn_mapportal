// app/google/components/GoogleMapClient.tsx
"use client";

import { useState } from 'react';
import { DocumentWithCategory } from '@/app/types/document';
import dynamic from 'next/dynamic';
import { FiMapPin } from 'react-icons/fi';

// โหลด GoogleMapView แบบ dynamic
const GoogleMapView = dynamic(() => import('@/app/google/components/GoogleMapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <FiMapPin className="w-8 h-8 mx-auto mb-2 text-orange-500 animate-bounce" />
        <p className="text-gray-600">กำลังโหลดแผนที่...</p>
      </div>
    </div>
  )
});

// โหลด GoogleDocumentSidebar
const GoogleDocumentSidebar = dynamic(() => import('./GoogleDocumentSidebar'), {
  ssr: false
});

interface GoogleMapClientProps {
  documents: DocumentWithCategory[];
  fullscreen?: boolean;
}

export default function GoogleMapClient({ documents, fullscreen = false }: GoogleMapClientProps) {
  // เรียงลำดับเอกสารล่าสุด
  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const containerClass = fullscreen 
    ? "fixed inset-0 w-full h-full" 
    : "rounded-xl overflow-hidden shadow-lg relative";

  return (
    <div className={containerClass}>
      <GoogleMapView 
        documents={documents} 
        fullscreen={fullscreen} 
        showNavigation={fullscreen}
      />
      
      {/* แสดง GoogleDocumentSidebar เฉพาะเมื่อไม่ใช่ fullscreen */}
      {!fullscreen && (
        <div className="absolute top-0 right-0 bottom-0 pointer-events-none z-10">
          <div className="relative h-full pointer-events-auto">
            <GoogleDocumentSidebar documents={recentDocuments} />
          </div>
        </div>
      )}
    </div>
  );
}