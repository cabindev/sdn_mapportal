// app/dashboard/components/documents/DocumentSkeleton.tsx
import React from 'react';

export default function DocumentSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {/* ตารางสำหรับหน้าจอขนาดใหญ่ */}
      <div className="hidden md:block">
        <div className="bg-gray-50 p-4 rounded-lg">
          {/* หัวตาราง */}
          <div className="grid grid-cols-12 gap-4 border-b border-gray-200 pb-3 mb-4">
            <div className="col-span-4">
              <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="col-span-2">
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
            <div className="col-span-2">
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
            <div className="col-span-2">
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
            <div className="col-span-2">
              <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
          
          {/* รายการเอกสารจำลอง */}
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 items-center">
              <div className="col-span-4 flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
              <div className="col-span-2">
                <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
              <div className="col-span-2">
                <div className="h-8 bg-gray-200 rounded-full w-8 animate-pulse"></div>
              </div>
              <div className="col-span-2">
                <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
              <div className="col-span-2 flex space-x-2 justify-end">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* การ์ดสำหรับหน้าจอขนาดเล็ก */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gray-200 rounded"></div>
              <div>
                <div className="h-5 bg-gray-200 rounded w-36 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">หมวดหมู่</div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">สถานะ</div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">สร้างเมื่อ</div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">แก้ไขล่าสุด</div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}