// app/dashboard/map/components/RecentUpdateNotification.tsx
"use client";

import { useState } from "react";
import { DocumentWithCategory } from "@/app/types/document";
import { X, MapPin, Clock } from "lucide-react";

// ฟังก์ชันสำหรับคำนวณเวลาที่ผ่านมา
function getTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMs = now.getTime() - date.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInSeconds < 60) return 'เมื่อสักครู่'
  if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`
  if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`
  return `${diffInDays} วันที่แล้ว`
}

interface RecentUpdateNotificationProps {
  documents: DocumentWithCategory[];
}

export default function RecentUpdateNotification({
  documents
}: RecentUpdateNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  // เลือกเอกสารที่อัปโหลดล่าสุด 1 รายการ (นับจาก createdAt)
  const latestDocument = [...documents]
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // เรียงจากวันที่อัปโหลดล่าสุด
    })[0];

  // แสดงเอกสารล่าสุดเสมอ ไม่จำกัดเวลา
  if (!isVisible || !latestDocument) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-[900] animate-slide-up">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-[320px] border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-medium">ข้อมูลอัปเดตล่าสุด</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Image */}
          <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden mb-2">
            {latestDocument.coverImage ? (
              <img
                src={latestDocument.coverImage}
                alt={latestDocument.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <div className="text-4xl">📄</div>
              </div>
            )}

            {/* Category Badge */}
            {latestDocument.category && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                {latestDocument.category.name}
              </div>
            )}
          </div>

          {/* Title */}
          <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-snug">
            {latestDocument.title}
          </h4>

          {/* Info */}
          <div className="space-y-1">
            {/* Location */}
            <div className="flex items-start gap-1.5 text-xs text-gray-600">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">
                {latestDocument.district}, {latestDocument.amphoe}, {latestDocument.province}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                อัปโหลด{getTimeAgo(latestDocument.createdAt.toString())}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
