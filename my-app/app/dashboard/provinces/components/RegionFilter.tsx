// app/dashboard/provinces/components/RegionFilter.tsx
'use client'

import { HealthZone, getThaiZoneName, getAllHealthZones } from '@/app/utils/healthZones'

interface RegionFilterProps {
  activeRegion: string;
  onRegionChange?: (region: string) => void;
}

export default function RegionFilter({ 
  activeRegion, 
  onRegionChange 
}: RegionFilterProps) {
  // รายชื่อภูมิภาคทั้งหมด
  const allRegions: Array<HealthZone | 'all'> = ['all', ...getAllHealthZones()]
  
  // ฟังก์ชันเปลี่ยนภูมิภาค
  const handleRegionChange = (region: string) => {
    if (onRegionChange) {
      onRegionChange(region)
    }
  }
  
  // ฟังก์ชันแปลงรหัสภูมิภาคเป็นชื่อภาษาไทย
  const getRegionName = (region: string) => {
    if (region === 'all') return 'ทุกภูมิภาค'
    return getThaiZoneName(region as HealthZone)
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h2 className="text-lg font-medium text-gray-700 mb-3">กรองตามภูมิภาค</h2>
      <div className="flex flex-wrap gap-2">
        {allRegions.map(region => (
          <button
            key={region}
            onClick={() => handleRegionChange(region)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${activeRegion === region 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
            }
          >
            {getRegionName(region)}
          </button>
        ))}
      </div>
    </div>
  )
}