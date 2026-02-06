// app/dashboard/provinces/components/RegionTabs.tsx
'use client'

import { useState } from 'react'
import { getProvinceHealthZone, getThaiZoneName, HealthZone } from '@/app/utils/healthZones'

interface RegionTabsProps {
  provinceName: string
  onRegionChange?: (region: HealthZone | 'all') => void
}

export default function RegionTabs({ provinceName, onRegionChange }: RegionTabsProps) {
  const currentZone = getProvinceHealthZone(provinceName)
  const [activeTab, setActiveTab] = useState<HealthZone | 'all'>('all')
  
  const allRegions: Array<HealthZone | 'all'> = [
    'all',
    'north-upper',
    'north-lower',
    'northeast-upper',
    'northeast-lower',
    'central',
    'east',
    'west',
    'south-upper',
    'south-lower',
    'bangkok'
  ]
  
  const handleTabChange = (region: HealthZone | 'all') => {
    setActiveTab(region)
    if (onRegionChange) {
      onRegionChange(region)
    }
  }
  
  const getTabName = (region: HealthZone | 'all') => {
    if (region === 'all') return 'ทั้งหมด'
    return getThaiZoneName(region)
  }
  
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">กรองตามภูมิภาค</h2>
      <div className="flex flex-wrap gap-2">
        {allRegions.map(region => (
          <button
            key={region}
            onClick={() => handleTabChange(region)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${region === currentZone ? 'border-2 border-gray-500' : ''}
              ${activeTab === region 
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
            }
          >
            {getTabName(region)}
          </button>
        ))}
      </div>
    </div>
  )
}