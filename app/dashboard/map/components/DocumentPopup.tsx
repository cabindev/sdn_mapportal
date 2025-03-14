// app/dashboard/map/components/DocumentPopup.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { DocumentWithCategory } from "@/app/types/document";
import { getCategoryColor } from "@/app/utils/colorGenerator";

interface DocumentPopupProps {
  document: DocumentWithCategory & { viewCount: number; downloadCount: number };
  onClose: () => void;
  onView: () => void;
  onDownload: () => void;
}

export default function DocumentPopup({ document, onClose, onView, onDownload }: DocumentPopupProps) {
  const colorScheme = getCategoryColor(document.categoryId);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const calculateDocumentAge = (documentYear: number): string => {
    if (!documentYear) return "";
    
    const currentYear = new Date().getFullYear() + 543; // แปลงเป็นปี พ.ศ.
    const yearDiff = currentYear - documentYear;
    
    if (yearDiff === 0) {
      return "ปีปัจจุบัน";
    } else if (yearDiff === 1) {
      return "1 ปีที่แล้ว";
    } else {
      return `${yearDiff} ปีที่แล้ว`;
    }
  };

  // ตรวจสอบว่ามีข้อความล้นหรือไม่
  useEffect(() => {
    if (descriptionRef.current) {
      const element = descriptionRef.current;
      setIsOverflowing(element.scrollHeight > element.clientHeight);
    }
  }, [document.description]);

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[999]" 
        onClick={onClose}
      />
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] max-w-[90vw] max-h-[90vh] bg-white rounded-xl shadow-2xl z-[1000] overflow-hidden animate-fade-in">
        <div className="relative h-[180px]" style={{ backgroundColor: `${colorScheme.primary}20` }}>
          {document.coverImage ? (
            <img 
              src={document.coverImage} 
              alt={document.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <div 
                className="w-[100px] h-[100px] rounded-full flex flex-col items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: colorScheme.primary }}
              >
                <div className="text-xl font-bold">เอกสาร</div>
                <div className="text-xs">{document.category?.name?.substring(0, 3) || ''}</div>
              </div>
            </div>
          )}
          
          <div 
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-sm font-medium shadow-md"
            style={{ backgroundColor: colorScheme.primary }}
          >
            {document.category?.name || 'ไม่ระบุหมวดหมู่'}
          </div>
          
          <button 
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black bg-opacity-25 text-white flex items-center justify-center text-lg"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">{document.title}</h3>
          
          <div className="flex items-center text-gray-600 text-sm mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {new Date(document.createdAt).toLocaleString('th-TH', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          
          {document.description && (
            <div className="mb-4">
              <div className="relative">
                <div 
                  ref={descriptionRef}
                  className={`text-sm text-gray-600 ${!isExpanded ? 'line-clamp-3' : ''}`}
                >
                  {document.description}
                </div>
                
                {isOverflowing && !isExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent"></div>
                )}
              </div>
              
              {isOverflowing && (
                <button 
                  className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'แสดงน้อยลง' : 'อ่านเพิ่มเติม'}
                </button>
              )}
            </div>
          )}
          
          <div className="rounded p-3 mb-4" style={{ 
            backgroundColor: `${colorScheme.primary}10`,
            borderLeft: `3px solid ${colorScheme.primary}` 
          }}>
            <div className="font-medium text-sm mb-1" style={{ color: colorScheme.primary }}>
              ตำแหน่งที่ตั้ง
            </div>
            <div className="text-sm text-gray-600">
              {document.district}, {document.amphoe}, {document.province}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              พิกัด: {document.latitude.toFixed(6)}, {document.longitude.toFixed(6)}
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {new Date(document.createdAt).toLocaleString('th-TH', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
            
            {document.year && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
              เอกสารออกเมื่อ  ปี พ.ศ. {document.year} 
                <span className="ml-1 text-gray-500">({calculateDocumentAge(document.year)})</span>
              </span>
            )}
          </div>

          <div className="flex text-xs text-gray-500 pt-3 border-t border-gray-200">
            <div className="flex items-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              จำนวนการดู: {document.viewCount}
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              ดาวน์โหลด: {document.downloadCount}
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <a 
              href={document.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center py-2.5 px-4 bg-white border-2 rounded-md text-black font-bold text-sm hover:bg-gray-50 transition-colors"
              style={{ borderColor: colorScheme.primary }}
              onClick={(e) => {
                e.preventDefault();
                onView();
                window.open(document.filePath, '_blank');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              ดูเอกสาร
            </a>
            <a 
              href={`${document.filePath}?download=true`}
              download
              className="flex-1 flex items-center justify-center py-2.5 px-4 bg-gray-200 border-2 border-gray-300 rounded-md text-black font-bold text-sm hover:bg-gray-300 transition-colors"
              onClick={() => {
                onDownload();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              ดาวน์โหลด
            </a>
          </div>
        </div>
      </div>
    </>
  );
}