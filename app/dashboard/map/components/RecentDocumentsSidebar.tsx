// app/dashboard/map/components/RecentDocumentsSidebar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { DocumentWithCategory } from "@/app/types/document";
import { getCategoryColor } from "@/app/utils/colorGenerator";

interface RecentDocumentsSidebarProps {
  documents: DocumentWithCategory[];
  onHoverDocument?: (documentId: number | null) => void;
}

export default function RecentDocumentsSidebar({ 
  documents: allDocuments, 
  onHoverDocument 
}: RecentDocumentsSidebarProps) {
  const map = useMap();
  const [hoveredDocId, setHoveredDocId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<DocumentWithCategory[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentWithCategory | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // กรองเอาเฉพาะ 10 เอกสารล่าสุด
  useEffect(() => {
    const sortedDocs = [...allDocuments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setDocuments(sortedDocs.slice(0, 10));
  }, [allDocuments]);

  // ป้องกันการ zoom แผนที่เมื่อ scroll ภายใน sidebar
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const preventZoom = (e: WheelEvent) => {
      e.stopPropagation();
    };

    scrollContainer.addEventListener('wheel', preventZoom);
    
    return () => {
      scrollContainer.removeEventListener('wheel', preventZoom);
    };
  }, []);

  // เมื่อเม้าส์ hover ที่เอกสาร - ดีเลย์การเลื่อนแผนที่เล็กน้อย
  const handleMouseEnter = (doc: DocumentWithCategory) => {
    setHoveredDocId(doc.id);
    if (onHoverDocument) {
      onHoverDocument(doc.id);
    }
    
    // ล้าง timer เดิมถ้ามี
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    
    // ตั้ง timer ใหม่เพื่อรอสักครู่ก่อนเลื่อนแผนที่
    hoverTimerRef.current = setTimeout(() => {
      // เลื่อนแผนที่ไปยังตำแหน่งเอกสาร
      map.flyTo([doc.latitude, doc.longitude], 12, {
        animate: true,
        duration: 1
      });
    }, 600); // รอ 600ms ก่อนเลื่อนแผนที่
  };
  
  // เมื่อเม้าส์ออกจากเอกสาร
  const handleMouseLeave = () => {
    setHoveredDocId(null);
    if (onHoverDocument) {
      onHoverDocument(null);
    }
    
    // ล้าง timer เมื่อเม้าส์ออก
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  // เมื่อคลิกที่เอกสาร
  const handleDocumentClick = (doc: DocumentWithCategory) => {
    setSelectedDoc(doc);
  };
  
  // ปิด popup
  const closePopup = () => {
    setSelectedDoc(null);
  };

  // ป้องกัน scroll propagation เพิ่มเติม
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };
  
  return (
    <>
      <div className="absolute top-4 right-16 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden z-[900] w-72 max-h-[calc(100vh-150px)] hidden md:block">
        <div className="px-3 py-2.5 bg-blue-50/90 backdrop-blur-sm border-b border-blue-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-blue-800">เอกสารล่าสุด</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {documents.length}
          </span>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" 
          style={{ maxHeight: 'calc(100vh - 200px)', height: 'auto' }}
          onWheel={handleWheel}
        >
          {documents.length > 0 ? (
            documents.map(doc => {
              const colorScheme = getCategoryColor(doc.categoryId);
              const isHovered = hoveredDocId === doc.id;
              
              return (
                <div 
                  key={doc.id}
                  className={`p-3 border-b border-gray-100/50 hover:bg-slate-50/80 transition-colors cursor-pointer ${isHovered ? 'bg-slate-50/80' : ''}`}
                  onMouseEnter={() => handleMouseEnter(doc)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleDocumentClick(doc)}
                >
                  <div className="flex items-start gap-3">
                    {doc.coverImage ? (
                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                        <img 
                          src={doc.coverImage} 
                          alt={doc.title}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div 
                        className="flex-shrink-0 w-16 h-16 rounded-md flex items-center justify-center"
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
                      
                      <div className="text-xs text-gray-500 flex items-center">
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

      {/* Document Popup */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" onClick={closePopup}>
          {(() => {
            const colorScheme = getCategoryColor(selectedDoc.categoryId);
            
            return (
              <div 
                className="bg-white rounded-lg shadow-xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col" 
                onClick={e => e.stopPropagation()}
              >
                <div 
                  className="p-4 border-b flex justify-between items-center"
                  style={{ 
                    backgroundColor: `${colorScheme.primary}10`,
                    borderColor: `${colorScheme.primary}30`
                  }}
                >
                  <h3 className="text-xl font-semibold" style={{ color: colorScheme.primary }}>
                    {selectedDoc.title}
                  </h3>
                  <button 
                    onClick={closePopup}
                    className="p-1.5 hover:bg-white/30 rounded-full text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="overflow-y-auto p-4 flex-grow">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedDoc.coverImage && (
                      <div className="w-full h-48 md:h-full rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={selectedDoc.coverImage} 
                          alt={selectedDoc.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div>
                      <div className="mb-4">
                        {selectedDoc.category && (
                          <span 
                            className="inline-block px-3 py-1 rounded-full text-sm font-medium" 
                            style={{ 
                              backgroundColor: `${colorScheme.primary}20`,
                              color: colorScheme.primary
                            }}
                          >
                            {selectedDoc.category.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">รายละเอียด</h4>
                          <p className="text-gray-800">{selectedDoc.description || 'ไม่มีรายละเอียด'}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">ตำแหน่ง</h4>
                          <p className="text-gray-800">
                            {selectedDoc.district}, {selectedDoc.amphoe}, {selectedDoc.province}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">วันที่สร้าง</h4>
                          <p className="text-gray-800">{new Date(selectedDoc.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="p-4 border-t flex justify-end gap-3"
                  style={{ 
                    backgroundColor: `${colorScheme.primary}05`,
                    borderColor: `${colorScheme.primary}20`
                  }}
                >
                  {selectedDoc.filePath && (
                    <>
                      <a 
                        href={selectedDoc.filePath} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          backgroundColor: colorScheme.primary,
                        }}
                        className="px-4 py-2 text-white rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        ดูเอกสาร
                      </a>
                      <a 
                        href={`${selectedDoc.filePath}?download=true`} 
                        download
                        style={{ 
                          backgroundColor: `${colorScheme.primary}15`,
                          color: colorScheme.primary
                        }}
                        className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        ดาวน์โหลด
                      </a>
                    </>
                  )}
                  <button 
                    onClick={closePopup}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg font-medium"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </>
  );
}