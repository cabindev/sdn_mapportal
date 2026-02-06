// app/dashboard/map/components/RegionalStats.tsx
import React, { useMemo } from 'react';
import { DocumentWithCategory } from '@/app/types/document';
import { getProvinceHealthZone, getThaiZoneName, HealthZone } from '@/app/utils/healthZones';

interface RegionalStatsProps {
  documents: DocumentWithCategory[];
}

export default function RegionalStats({ documents }: RegionalStatsProps) {
  // ใช้ useMemo เพื่อคำนวณค่าเมื่อ documents เปลี่ยนแปลงเท่านั้น
  const { totalDocuments, zoneCounts } = useMemo(() => {
    const total = documents.length;
    const counts: Record<HealthZone, number> = {
      "north-upper": 0,
      "north-lower": 0,
      "northeast-upper": 0,
      "northeast-lower": 0,
      "central": 0,
      "east": 0,
      "west": 0,
      "south-upper": 0,
      "south-lower": 0,
      "bangkok": 0
    };
    
    // วนลูปผ่านเอกสารทั้งหมดเพื่อนับจำนวนตามโซน
    documents.forEach(doc => {
      if (doc.province) {
        const zone = getProvinceHealthZone(doc.province);
        counts[zone]++;
      } else {
        // ถ้าไม่มีข้อมูลจังหวัด ให้นับเป็นกลาง
        counts.central++;
      }
    });
    
    return { totalDocuments: total, zoneCounts: counts };
  }, [documents]);
  
  // แสดงโซนทั้งหมด
  const zoneDisplay = [
    { code: "north-upper", name: "เหนือบน" },
    { code: "north-lower", name: "เหนือล่าง" },
    { code: "northeast-upper", name: "อีสานบน" },
    { code: "northeast-lower", name: "อีสานล่าง" },
    { code: "central", name: "กลาง" },
    { code: "east", name: "ตะวันออก" },
    { code: "west", name: "ตะวันตก" },
    { code: "south-upper", name: "ใต้บน" },
    { code: "south-lower", name: "ใต้ล่าง" },
    { code: "bangkok", name: "กรุงเทพฯ" }
  ];
  
  return (
    <div className="w-full">
      <div className="space-y-2">
        {zoneDisplay.map(zone => {
          const count = zoneCounts[zone.code as HealthZone] || 0;
          const percent = totalDocuments > 0 ? Math.round((count / totalDocuments) * 100) : 0;
          
          return (
            <div key={zone.code} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-xs font-medium text-gray-800">{zone.name}</span>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="font-light">{count}</span>
                <span className="font-medium">({percent}%)</span>
              </div>
            </div>
          );
        })}
        
        {/* สรุปรวม */}
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600 font-light">รวมทั้งหมด</span>
            <span className="font-medium text-gray-800">{totalDocuments} เอกสาร</span>
          </div>
        </div>
      </div>
    </div>
  );
}