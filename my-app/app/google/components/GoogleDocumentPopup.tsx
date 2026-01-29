// app/google/components/GoogleDocumentPopup.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { DocumentWithCategory } from "@/app/types/document";
import { Download, MapPin, Calendar, Eye, X, ChevronDown, ChevronUp, User, Clock, Tag } from "lucide-react";

// ฟังก์ชันสำหรับคำนวณเวลาที่ผ่านมา
function getTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMs = now.getTime() - date.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInMonths = Math.floor(diffInDays / 30)
  const diffInYears = Math.floor(diffInDays / 365)

  if (diffInSeconds < 60) return 'เมื่อสักครู่'
  if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`
  if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`
  if (diffInDays < 30) return `${diffInDays} วันที่แล้ว`
  if (diffInMonths < 12) return `${diffInMonths} เดือนที่แล้ว`
  return `${diffInYears} ปีที่แล้ว`
}

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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
    if (document.description) {
      // ตรวจสอบจากความยาวของข้อความ (ประมาณ 200 ตัวอักษร = 4 บรรทัด)
      setIsOverflowing(document.description.length > 200);
    }
  }, [document.description]);

  // Scroll ลงล่างเมื่อขยาย description
  const handleToggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);

    // ถ้าจะขยาย ให้ scroll ลงล่างหลังจาก render
    if (!isDescriptionExpanded) {
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTo({
            top: contentRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  return (
    <div className={`font-sans transition-all duration-300 ${isExpanded ? 'w-[420px]' : 'w-[360px]'}`}>
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        {/* รูปภาพด้านบน */}
        <div className="relative h-32 bg-gray-50 overflow-hidden">
          {document.coverImage && !imageError ? (
            <img
              src={document.coverImage}
              alt={document.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
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
        <div ref={contentRef} className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
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
          <h3 className={`font-medium text-gray-900 mb-3 leading-relaxed ${isExpanded ? 'text-base' : 'text-sm'}`}>
            {document.title}
          </h3>
          
          {/* Meta Information - แสดงเมื่อขยาย */}
          {isExpanded && (
            <div className="space-y-2.5 mb-4 text-sm">
              {/* Category */}
              {document.category && (
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <div className="text-gray-600 text-sm">
                    {document.category.name}
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-gray-600 text-sm">
                    {document.district}, {document.amphoe}, {document.province}
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {document.latitude.toFixed(6)}, {document.longitude.toFixed(6)}
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start gap-2">
                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="text-gray-600 text-sm">
                  <div>อัปโหลด: {new Date(document.createdAt).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</div>
                  {document.year && (
                    <div className="text-gray-500 text-xs mt-0.5">
                      เอกสารปี พ.ศ. {document.year} ({calculateDocumentAge(document.year)})
                    </div>
                  )}
                </div>
              </div>

              {/* Last Updated */}
              {document.updatedAt && document.updatedAt !== document.createdAt && (
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-gray-600 text-sm">
                    <span className="text-emerald-600">ข้อมูลล่าสุด: {getTimeAgo(document.updatedAt.toString())}</span>
                    <div className="text-gray-500 text-xs mt-0.5">
                      {new Date(document.updatedAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Views and Downloads */}
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <div className="text-gray-600 text-sm">
                  ดู {(document.viewCount || 0).toLocaleString()} ครั้ง
                  <span className="mx-2 text-gray-300">•</span>
                  ดาวน์โหลด {(document.downloadCount || 0).toLocaleString()} ครั้ง
                </div>
              </div>

              {/* Uploader */}
              {document.user && (
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">
                      {document.user.firstName} {document.user.lastName}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      document.user.role === 'ADMIN'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {document.user.role === 'ADMIN' ? 'Admin' : 'สมาชิก'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Description */}
          {document.description && (
            <div className="mb-4">
              <div className="relative">
                <div
                  ref={descriptionRef}
                  className={`text-gray-600 leading-relaxed ${
                    isExpanded ? 'text-sm' : 'text-xs'
                  } ${!isDescriptionExpanded ? 'line-clamp-4' : ''}`}
                >
                  {document.description}
                </div>

                {!isDescriptionExpanded && isOverflowing && (
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                )}
              </div>

              {isOverflowing && (
                <button
                  type="button"
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700 transition-colors font-medium"
                  onClick={handleToggleDescription}
                >
                  {isDescriptionExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}
          
          {/* Compact info - แสดงเมื่อไม่ขยาย */}
          {!isExpanded && (
            <div className="space-y-1.5 mb-3">
              {/* Category */}
              {document.category && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Tag className="w-3 h-3 flex-shrink-0" />
                  <span>{document.category.name}</span>
                </div>
              )}

              {/* Location */}
              <div className="bg-gray-50 p-2 rounded-md">
                <span className="text-xs text-gray-500 flex items-center">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                  {document.district}, {document.amphoe}, {document.province}
                </span>
              </div>

              {/* Views and Downloads */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Eye className="w-3 h-3 flex-shrink-0" />
                <span>
                  ดู {(document.viewCount || 0).toLocaleString()} ครั้ง
                  <span className="mx-1.5 text-gray-300">•</span>
                  ดาวน์โหลด {(document.downloadCount || 0).toLocaleString()} ครั้ง
                </span>
              </div>

              {/* Upload date */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>{new Date(document.createdAt).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}</span>
              </div>

              {/* Last updated - if exists */}
              {document.updatedAt && document.updatedAt !== document.createdAt && (
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <Clock className="w-3 h-3" />
                  <span>Updated {getTimeAgo(document.updatedAt.toString())}</span>
                </div>
              )}

              {/* User info */}
              {document.user && (
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {document.user.firstName} {document.user.lastName}
                  </span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                    document.user.role === 'ADMIN'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {document.user.role === 'ADMIN' ? 'Admin' : 'Member'}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Download Button */}
          <div className="flex gap-2">
            <a
              href={`${document.filePath}?download=true`}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}