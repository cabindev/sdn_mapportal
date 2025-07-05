// app/dashboard/provinces/components/ProvinceFilter.tsx
'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ProvinceFilterProps {
  initialSearch: string;
  onSearchChange: (search: string) => void;
}

export default function ProvinceFilter({ initialSearch = '', onSearchChange }: ProvinceFilterProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  
  // อัพเดต searchTerm เมื่อ initialSearch เปลี่ยน
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);
  
  // ส่งค่าค้นหาเมื่อพิมพ์เสร็จแล้ว (debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== initialSearch) {
        onSearchChange(searchTerm);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, initialSearch, onSearchChange]);
  
  // ฟังก์ชันล้างการค้นหา
  const clearSearch = () => {
    setSearchTerm('');
    onSearchChange('');
  };
  
  // ฟังก์ชันจัดการการ submit ฟอร์ม
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchTerm);
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-grow relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาตามชื่อจังหวัด..."
            className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}