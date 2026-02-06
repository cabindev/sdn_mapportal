// app/dashboard/provinces/components/ProvincesPageClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { MapIcon, FunnelIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import ProvinceTable from './ProvinceTable'
import { Province } from '@/app/dashboard/components/types/province'

interface ProvincesPageClientProps {
  provinces: Province[];
  initialRegion: string;
  initialSearch: string;
}

export default function ProvincesPageClient({ 
  provinces,
  initialRegion,
  initialSearch
}: ProvincesPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [filteredProvinces, setFilteredProvinces] = useState<Province[]>(provinces);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  
  // กรองตามคำค้นหา (ทำที่ client-side)
  useEffect(() => {
    if (!initialSearch) {
      setFilteredProvinces(provinces);
      return;
    }
    
    const searchLower = initialSearch.toLowerCase();
    const filtered = provinces.filter(province => 
      province.name.toLowerCase().includes(searchLower)
    );
    
    setFilteredProvinces(filtered);
  }, [provinces, initialSearch]);
  
  // ฟังก์ชันเปลี่ยนภูมิภาค
  const handleRegionChange = (region: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (region === 'all') {
      params.delete('region');
    } else {
      params.set('region', region);
    }
    
    // ส่ง request ใหม่เพื่อดึงข้อมูลจังหวัดตามภูมิภาค
    router.push(`${pathname}?${params.toString()}`);
    
    // ปิดกล่องกรองบนมือถือหลังจากเลือกตัวกรอง
    setShowFiltersMobile(false);
  };
  
  // ฟังก์ชันค้นหา
  const handleSearch = (search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  // รายชื่อปุ่มกรองภูมิภาค
  const regionButtons = [
    { id: 'all', name: 'ทุกภูมิภาค' },
    { id: 'north-upper', name: 'เหนือบน' },
    { id: 'north-lower', name: 'เหนือล่าง' },
    { id: 'northeast-upper', name: 'อีสานบน' },
    { id: 'northeast-lower', name: 'อีสานล่าง' },
    { id: 'central', name: 'กลาง' },
    { id: 'east', name: 'ตะวันออก' },
    { id: 'west', name: 'ตะวันตก' },
    { id: 'south-upper', name: 'ใต้บน' },
    { id: 'south-lower', name: 'ใต้ล่าง' },
    { id: 'bangkok', name: 'กรุงเทพฯ' }
  ];
  
  // หาชื่อภูมิภาคจาก ID
  const getRegionName = (regionId: string) => {
    const region = regionButtons.find(r => r.id === regionId);
    return region ? region.name : 'ทุกภูมิภาค';
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* หัวข้อและปุ่มเปิดตัวกรองบนมือถือ */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <MapIcon className="w-8 h-8 text-gray-600 mr-3" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">ข้อมูลเอกสารตามพื้นที่จังหวัด ({filteredProvinces.length})</h1>
        </div>
        
        {/* ปุ่มเปิดตัวกรองบนมือถือ */}
        <button 
          className="md:hidden flex items-center py-2 px-3 bg-gray-50 text-gray-600 rounded-lg"
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
        >
          <AdjustmentsHorizontalIcon className="w-5 h-5 mr-1" />
          กรอง
        </button>
      </div>

      {/* ตัวแสดงตัวกรองที่ใช้อยู่บนมือถือ */}
      {(initialRegion !== 'all' || initialSearch) && (
        <div className="md:hidden flex flex-wrap gap-2 mb-4">
          {initialRegion !== 'all' && (
            <div className="flex items-center bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm">
              <span className="mr-1">ภูมิภาค: {getRegionName(initialRegion)}</span>
              <button 
                onClick={() => handleRegionChange('all')}
                aria-label="ลบตัวกรอง"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {initialSearch && (
            <div className="flex items-center bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm">
              <span className="mr-1">ค้นหา: {initialSearch}</span>
              <button 
                onClick={() => handleSearch('')}
                aria-label="ลบคำค้นหา"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ส่วนตัวกรองสำหรับหน้าจอใหญ่ */}
      <div className="hidden md:block mb-8">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-4">
          <h2 className="text-lg font-medium text-gray-700 mb-3">กรองตามภูมิภาค</h2>
          <div className="flex flex-wrap gap-2">
            {regionButtons.map(button => (
              <button
                key={button.id}
                onClick={() => handleRegionChange(button.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${initialRegion === button.id 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                }
              >
                {button.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex gap-4">
            <div className="flex-grow relative">
              <input
                type="text"
                value={initialSearch}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="ค้นหาตามชื่อจังหวัด..."
                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* ส่วนตัวกรองสำหรับหน้าจอมือถือ (แสดงเมื่อกดปุ่มกรอง) */}
      {showFiltersMobile && (
        <div className="md:hidden mb-6">
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-start overflow-y-auto pt-16 pb-16">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md mx-auto z-50">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-medium">ตั้งค่าตัวกรอง</h2>
                <button 
                  onClick={() => setShowFiltersMobile(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium text-gray-700 mb-3">กรองตามภูมิภาค</h3>
                <div className="flex flex-wrap gap-2">
                  {regionButtons.map(button => (
                    <button
                      key={button.id}
                      onClick={() => handleRegionChange(button.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                        ${initialRegion === button.id 
                          ? 'bg-gray-800 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                      }
                    >
                      {button.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">ค้นหาจังหวัด</h3>
                <input
                  type="text"
                  value={initialSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="ค้นหาตามชื่อจังหวัด..."
                  className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
              
              <div className="p-4 border-t flex justify-end">
                <button
                  onClick={() => setShowFiltersMobile(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ช่องค้นหาแบบง่ายสำหรับมือถือ (เมื่อไม่ได้เปิดตัวกรอง) */}
      {!showFiltersMobile && (
        <div className="md:hidden mb-6">
          <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={initialSearch}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="ค้นหาตามชื่อจังหวัด..."
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-700">
            ตารางแสดงข้อมูลจังหวัด 
            {initialRegion !== 'all' && (
              <span className="hidden md:inline ml-2 text-sm font-normal text-gray-500">
                (กรองตามภูมิภาค: {getRegionName(initialRegion)})
              </span>
            )}
            {initialSearch && (
              <span className="hidden md:inline ml-2 text-sm font-normal text-gray-500">
                (ค้นหา: {initialSearch})
              </span>
            )}
          </h2>
        </div>
        
        <ProvinceTable 
          provinces={filteredProvinces}
          regionFilter={initialRegion}
          searchFilter={initialSearch}
        />
      </div>
    </div>
  )
}