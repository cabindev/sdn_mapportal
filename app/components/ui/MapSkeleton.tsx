// app/components/ui/MapSkeleton.tsx
import React from 'react';

export default function MapSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">กำลังโหลดแผนที่...</p>
        <p className="text-sm text-gray-500 max-w-xs mt-2">กรุณารอสักครู่ ระบบกำลังนำข้อมูลมาแสดงผล</p>
      </div>
    </div>
  );
}