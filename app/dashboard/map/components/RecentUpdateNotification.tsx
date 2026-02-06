// app/dashboard/map/components/RecentUpdateNotification.tsx
"use client";

import { useState, useEffect, useRef } from "react";
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
  const [isHovering, setIsHovering] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // เลือกเอกสารที่อัปโหลดล่าสุด 1 รายการ (นับจาก createdAt)
  const latestDocument = [...documents]
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // เรียงจากวันที่อัปโหลดล่าสุด
    })[0];

  // Auto-hide หลัง 5 วินาที (หยุดเมื่อ hover)
  useEffect(() => {
    if (!isVisible || isHovering) {
      // หยุด timer เมื่อ hover
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // เริ่ม countdown
    const startTime = Date.now();
    const duration = 2000; // 3 วินาที
    const startProgress = progress;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, startProgress - (elapsed / duration) * startProgress);
      setProgress(remaining);

      if (remaining <= 0) {
        setIsVisible(false);
      }
    }, 50);

    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, (startProgress / 100) * duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isVisible, isHovering, progress]);

  // แสดงเอกสารล่าสุดเสมอ ไม่จำกัดเวลา
  if (!isVisible || !latestDocument) {
    return null;
  }

  return (
    <div
      className="hidden md:block fixed bottom-6 left-6 z-[900] animate-slide-up"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-[320px] border border-gray-100">
        {/* Progress bar - countdown */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-emerald-500 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-medium">ข้อมูลอัปเดตล่าสุด</span>
          </div>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="text-white/80 hover:text-white transition-colors"
            title="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Image */}
          <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden mb-2">
            <img
              src={latestDocument.coverImage || '/cover.svg'}
              alt={latestDocument.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/cover.svg';
              }}
            />

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
