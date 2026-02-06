// app/dashboard/map/components/DocumentPopup.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { DocumentWithCategory } from "@/app/types/document";
import { Download, MapPin, Calendar, Eye, X, User, Clock } from "lucide-react";

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

interface DocumentPopupProps {
  document: DocumentWithCategory & { viewCount: number; downloadCount: number };
  onClose: () => void;
  onView: () => void;
  onDownload: () => void;
}

export default function DocumentPopup({ document, onClose, onView, onDownload }: DocumentPopupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // ลบ useEffect ออก - จะนับเมื่อกดปุ่มแทน

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

        {/* Header with Image - 16:9 aspect ratio */}
        <div className="relative w-full bg-gray-50 overflow-hidden" style={{ paddingTop: "56.25%" }}>
          <img
            src={imageError ? '/cover.svg' : (document.coverImage || '/cover.svg')}
            alt={document.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          
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
        <div className="p-6 pb-20 overflow-y-auto max-h-[calc(85vh-12rem)]">
          {/* Title */}
          <h3 className="text-xl font-medium text-gray-900 mb-4 leading-relaxed">
            {document.title}
          </h3>
          
          {/* Meta Information */}
          <div className="space-y-3 mb-6">
            {/* Location */}
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-gray-900 font-medium">
                  {document.district}, {document.amphoe}, {document.province}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  {document.latitude.toFixed(6)}, {document.longitude.toFixed(6)}
                </div>
              </div>
            </div>
            
            {/* Date */}
            <div className="flex items-start gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="text-gray-900 font-medium">
                <div>อัปโหลด: {new Date(document.createdAt).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</div>
                {document.year && (
                  <div className="text-gray-500 text-xs mt-1">
                    เอกสารปี พ.ศ. {document.year} ({calculateDocumentAge(document.year)})
                  </div>
                )}
              </div>
            </div>

            {/* Last Updated */}
            {document.updatedAt && document.updatedAt !== document.createdAt && (
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="text-gray-900 font-medium">
                  <span className="text-emerald-600">ข้อมูลล่าสุด: {getTimeAgo(document.updatedAt.toString())}</span>
                  <div className="text-gray-500 text-xs mt-1">
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
            <div className="flex items-center gap-3 text-sm">
              <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="text-gray-900 font-medium">
                ดู {document.viewCount.toLocaleString()} ครั้ง
                <span className="mx-2 text-gray-300">•</span>
                ดาวน์โหลด {document.downloadCount.toLocaleString()} ครั้ง
              </div>
            </div>

            {/* Uploader */}
            {document.user && (
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 font-medium">
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
          
          {/* Description */}
          {document.description && (
            <div className="mb-6">
              <div className="relative">
                <div 
                  ref={descriptionRef}
                  className={`text-sm text-gray-600 leading-relaxed ${!isExpanded ? 'line-clamp-4' : ''}`}
                >
                  {document.description}
                </div>
                
                {isOverflowing && !isExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
                )}
              </div>
              
              {isOverflowing && (
                <button 
                  type="button"
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700 transition-colors font-medium"
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg text-sm font-medium transition-colors"
              onClick={() => {
              onDownload();
              }}
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