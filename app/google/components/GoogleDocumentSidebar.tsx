"use client";

import { useState, useRef } from "react";
import { DocumentWithCategory } from "@/app/types/document";
import { getCategoryColor } from "@/app/utils/colorGenerator";
import DocumentPopup from "@/app/dashboard/map/components/DocumentPopup";
import { createPortal } from "react-dom";

interface GoogleDocumentSidebarProps {
  documents: DocumentWithCategory[];
  onSelectLocation?: (lat: number, lng: number, zoom: number) => void;
}

export default function GoogleDocumentSidebar({ 
  documents,
  onSelectLocation 
}: GoogleDocumentSidebarProps) {
  const [hoveredDocId, setHoveredDocId] = useState<number | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentWithCategory | null>(null);
  const [viewCount, setViewCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // เมื่อเม้าส์ hover ที่เอกสาร
  const handleMouseEnter = (doc: DocumentWithCategory) => {
    setHoveredDocId(doc.id);
    
    // ล้าง timer เดิมถ้ามี
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    
    // ตั้ง timer ใหม่เพื่อรอสักครู่ก่อนเลื่อนแผนที่
    hoverTimerRef.current = setTimeout(() => {
      // เลื่อนแผนที่ไปยังตำแหน่งเอกสาร
      if (onSelectLocation) {
        onSelectLocation(doc.latitude, doc.longitude, 14);
      }
    }, 600); // รอ 600ms ก่อนเลื่อนแผนที่
  };
  
  // เมื่อเม้าส์ออกจากเอกสาร
  const handleMouseLeave = () => {
    setHoveredDocId(null);
    
    // ล้าง timer เมื่อเม้าส์ออก
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    
    // กลับไปที่มุมมองแผนที่เริ่มต้น
    if (onSelectLocation) {
      onSelectLocation(15.870032, 100.992541, 6);
    }
  };

  // เมื่อคลิกที่เอกสาร
  const handleDocumentClick = (doc: DocumentWithCategory) => {
    setSelectedDoc(doc);
    setViewCount(doc.viewCount);
    setDownloadCount(doc.downloadCount);
  };
  
  // ปิด popup
  const closePopup = () => {
    setSelectedDoc(null);
  };

  // ฟังก์ชันเพิ่มจำนวนการดู
  const handleViewDocument = async () => {
    if (!selectedDoc) return;
    
    try {
      // เรียกใช้ API สำหรับเพิ่มจำนวนการดู
      const response = await fetch(`/api/documents/view/${selectedDoc.id}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setViewCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };
  
  // ฟังก์ชันเพิ่มจำนวนการดาวน์โหลด
  const handleDownload = async () => {
    if (!selectedDoc) return;
    
    try {
      // เรียกใช้ API สำหรับเพิ่มจำนวนการดาวน์โหลด
      const response = await fetch(`/api/documents/download/${selectedDoc.id}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setDownloadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  };
  
  return (
    <>
      <div className="absolute top-1/2 transform -translate-y-1/2 left-4 bg-white/95 rounded-lg shadow-lg overflow-hidden z-[1] w-80 max-h-[calc(100vh-100px)] hidden md:block">
        <div className="px-3 py-2.5 bg-orange-100 border-b border-orange-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-orange-800">เอกสารล่าสุด</h3>
          <span className="text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full">
            {documents.length}
          </span>
        </div>  
        
        <div 
          ref={scrollContainerRef}
          className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" 
          style={{ maxHeight: 'calc(100vh - 200px)', height: 'auto' }}
        >
          {documents.length > 0 ? (
            documents.map(doc => {
              const colorScheme = getCategoryColor(doc.categoryId);
              const isHovered = hoveredDocId === doc.id;
              
              return (
                <div 
                  key={doc.id}
                  className={`p-3 border-b border-gray-200 hover:bg-slate-100 transition-colors cursor-pointer ${isHovered ? 'bg-slate-100' : ''}`}
                  onMouseEnter={() => handleMouseEnter(doc)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleDocumentClick(doc)}
                >
                  <div className="flex items-start gap-3">
                    {doc.coverImage ? (
                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden shadow-sm">
                        <img 
                          src={doc.coverImage} 
                          alt={doc.title}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div 
                        className="flex-shrink-0 w-16 h-16 rounded-md flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${colorScheme.primary}20` }}
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: colorScheme.primary }}
                        >
                          <span className="text-white text-xs font-medium">{doc.category?.name?.substring(0, 2) || ''}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1" title={doc.title}>
                        {doc.title}
                      </h4>
                      
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs" style={{ 
                          backgroundColor: `${colorScheme.primary}20`,
                          color: colorScheme.primary
                        }}>
                          {doc.category?.name || 'ไม่ระบุหมวดหมู่'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {doc.district}, {doc.amphoe}, {doc.province}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 px-4 text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">ไม่พบเอกสารล่าสุด</p>
            </div>
          )}
        </div>
      </div>

      {/* แสดง DocumentPopup เมื่อมีการเลือกเอกสาร */}
      {selectedDoc && typeof document !== 'undefined' && createPortal(
        <DocumentPopup 
          document={{
            ...selectedDoc,
            viewCount,
            downloadCount
          }}
          onClose={closePopup}
          onView={handleViewDocument}
          onDownload={handleDownload}
        />,
        document.body
      )}
    </>
  );
}