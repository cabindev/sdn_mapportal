// app/dashboard/map/components/DocumentPopup.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { DocumentWithCategory } from "@/app/types/document";
import { Download, MapPin, Calendar, Eye, X } from "lucide-react";

interface DocumentPopupProps {
  document: DocumentWithCategory & { viewCount: number; downloadCount: number };
  onClose: () => void;
  onView: () => void;
  onDownload: () => void;
}

export default function DocumentPopup({ document, onClose, onView, onDownload }: DocumentPopupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const calculateDocumentAge = (documentYear: number): string => {
    if (!documentYear) return "";
    
    const currentYear = new Date().getFullYear() + 543;
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
        className="fixed inset-0 bg-black/20 z-[999]" 
        onClick={onClose}
      />
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-w-[90vw] max-h-[85vh] bg-white rounded-2xl shadow-xl z-[1000] overflow-hidden">
        
        {/* Header with Image */}
        <div className="relative h-48 bg-gray-50 overflow-hidden">
          {document.coverImage ? (
            <img 
              src={document.coverImage} 
              alt={document.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center">
                <div className="text-2xl">📄</div>
              </div>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {document.category?.name || 'เอกสาร'}
          </div>
          
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
            onClick={onClose}
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 192px)' }}>
          {/* Title */}
          <h3 className="text-xl font-light text-gray-900 mb-4 leading-relaxed">
            {document.title}
          </h3>
          
          {/* Meta Information */}
          <div className="space-y-3 mb-6">
            {/* Location */}
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-gray-900 font-light">
                  {document.district}, {document.amphoe}, {document.province}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  {document.latitude.toFixed(6)}, {document.longitude.toFixed(6)}
                </div>
              </div>
            </div>
            
            {/* Date */}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="text-gray-900 font-light">
                {new Date(document.createdAt).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
                {document.year && (
                  <span className="ml-2 text-gray-500 text-xs">
                    • เอกสารปี พ.ศ. {document.year} ({calculateDocumentAge(document.year)})
                  </span>
                )}
              </div>
            </div>
            
            {/* Views and Downloads */}
            <div className="flex items-center gap-3 text-sm">
              <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="text-gray-900 font-light">
                ดู {document.viewCount.toLocaleString()} ครั้ง
                <span className="mx-2 text-gray-300">•</span>
                ดาวน์โหลด {document.downloadCount.toLocaleString()} ครั้ง
              </div>
            </div>
          </div>
          
          {/* Description */}
          {document.description && (
            <div className="mb-6">
              <div className="relative">
                <div 
                  ref={descriptionRef}
                  className={`text-sm text-gray-600 font-light leading-relaxed ${!isExpanded ? 'line-clamp-4' : ''}`}
                >
                  {document.description}
                </div>
                
                {isOverflowing && !isExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
                )}
              </div>
              
              {isOverflowing && (
                <button 
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700 transition-colors font-light"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'แสดงน้อยลง' : 'อ่านเพิ่มเติม'}
                </button>
              )}
            </div>
          )}
          
          {/* Download Button */}
            {/* Floating Download Button - Bottom Right */}
            <div className="fixed bottom-6 right-6 z-[1100]">
            <a
              href={`${document.filePath}?download=true`}
              download
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg text-sm font-light transition-colors"
              onClick={() => {
              onDownload();
              }}
              style={{ minWidth: 0 }}
            >
              <Download className="w-4 h-4" />
              ดาวน์โหลด
            </a>
            </div>
        </div>
      </div>
    </>
  );
}