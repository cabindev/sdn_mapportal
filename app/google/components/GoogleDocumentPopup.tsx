// app/google/components/GoogleDocumentPopup.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { DocumentWithCategory } from "@/app/types/document";
import { Download, MapPin, Calendar, Eye, X, ChevronDown, ChevronUp } from "lucide-react";

interface GoogleDocumentPopupProps {
  document: DocumentWithCategory;
  position: { lat: number; lng: number };
  onClose: () => void;
  isExpanded: boolean;
  onToggleExpand: (e?: React.MouseEvent) => void;
}

export default function GoogleDocumentPopup({ 
  document, 
  position, 
  onClose, 
  isExpanded, 
  onToggleExpand 
}: GoogleDocumentPopupProps) {
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

  // ตรวจสอบว่าข้อความล้นหรือไม่
  useEffect(() => {
    if (descriptionRef.current) {
      const element = descriptionRef.current;
      setIsOverflowing(element.scrollHeight > element.clientHeight);
    }
  }, [document.description]);

  return (
    <div className={`font-sans transition-all duration-300 ${isExpanded ? 'w-[420px]' : 'w-[360px]'}`}>
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        {/* รูปภาพด้านบน */}
        <div className="relative h-32 bg-gray-50 overflow-hidden">
          {document.coverImage ? (
            <img 
              src={document.coverImage} 
              alt={document.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.parentElement!.innerHTML = `
                  <div class="flex items-center justify-center w-full h-full bg-gray-100">
                    <div class="text-center">
                      <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                      <p class="text-xs text-gray-500 font-medium">ไม่มีรูปภาพ</p>
                    </div>
                  </div>
                `;
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-100">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 font-medium">ไม่มีรูปภาพ</p>
              </div>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {document.category?.name || 'เอกสาร'}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Header with expand button */}
          <div className="flex justify-end items-start mb-3">
            <button 
              onClick={onToggleExpand}
              className="text-gray-500 hover:text-gray-800 transition-colors flex-shrink-0"
              title={isExpanded ? "ย่อข้อมูล" : "ขยายข้อมูล"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {/* Title */}
          <h3 className={`font-semibold text-gray-800 mb-3 leading-tight ${isExpanded ? 'text-lg' : 'text-base'}`}>
            {document.title}
          </h3>
          
          {/* Meta Information - แสดงเมื่อขยาย */}
          {isExpanded && (
            <div className="space-y-2 mb-4 text-sm">
              {/* Location */}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-gray-700 font-medium">
                    {document.district}, {document.amphoe}, {document.province}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {document.latitude.toFixed(6)}, {document.longitude.toFixed(6)}
                  </div>
                </div>
              </div>
              
              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="text-gray-700">
                  {new Date(document.createdAt).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                  {document.year && (
                    <span className="ml-2 text-gray-500 text-xs">
                      • พ.ศ. {document.year} ({calculateDocumentAge(document.year)})
                    </span>
                  )}
                </div>
              </div>
              
              {/* Views and Downloads */}
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="text-gray-700 text-sm">
                  ดู {(document.viewCount || 0).toLocaleString()} ครั้ง
                  <span className="mx-2 text-gray-300">•</span>
                  ดาวน์โหลด {(document.downloadCount || 0).toLocaleString()} ครั้ง
                </div>
              </div>
            </div>
          )}
          
          {/* Description */}
          <div className="mb-4">
            <div className="relative">
              <div 
                ref={descriptionRef}
                className={`text-gray-600 leading-relaxed ${
                  isExpanded ? 'text-sm' : 'text-xs'
                } ${!isExpanded ? 'line-clamp-2' : ''}`}
              >
                {document.description}
              </div>
            </div>
          </div>
          
          {/* Location badge - แสดงเมื่อไม่ขยาย */}
          {!isExpanded && (
            <div className="bg-gray-50 p-2 rounded-md mb-3">
              <span className="text-xs text-gray-600 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {document.district}, {document.amphoe}, {document.province}
              </span>
            </div>
          )}
          
          {/* Download Button */}
          <div className="flex gap-2">
            <a 
              href={`${document.filePath}?download=true`}
              target="_blank" 
              rel="noopener noreferrer"
              download
              className="flex-1 py-2 px-3 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium rounded-lg text-center transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Download className="w-3 h-3" />
              ดาวน์โหลดเอกสาร
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}