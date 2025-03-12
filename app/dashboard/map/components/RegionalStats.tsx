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
    { code: "north-upper", name: "เหนือบน", color: "#FFD400" },
    { code: "north-lower", name: "เหนือล่าง", color: "#FF7733" },
    { code: "northeast-upper", name: "อีสานบน", color: "#FF1654" },
    { code: "northeast-lower", name: "อีสานล่าง", color: "#D90368" },
    { code: "central", name: "กลาง", color: "#65B891" },
    { code: "east", name: "ตะวันออก", color: "#247BA0" },
    { code: "west", name: "ตะวันตก", color: "#05D9E8" },
    { code: "south-upper", name: "ใต้บน", color: "#99E1D9" },
    { code: "south-lower", name: "ใต้ล่าง", color: "#008148" },
    { code: "bangkok", name: "กรุงเทพฯ", color: "#202020" }
  ];
  
  return (
    <div className="w-full">
      <h2 className="font-medium text-slate-800 mb-3">การกระจายตามโซนสุขภาพ</h2>
      <div className="bg-slate-50 rounded-lg p-3">
        <div className="text-center mb-3">
          <span className="text-sm text-slate-600">จำนวนเอกสารทั้งหมด</span>
          <div className="text-2xl font-bold text-slate-800">{totalDocuments}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {zoneDisplay.map(zone => {
            const count = zoneCounts[zone.code as HealthZone] || 0;
            const percent = totalDocuments > 0 ? Math.round((count / totalDocuments) * 100) : 0;
            
            return (
              <div key={zone.code} className="p-2 text-center">
                <div className="bg-white rounded-lg p-2 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-1.5" 
                      style={{ backgroundColor: zone.color }}
                    ></span>
                    <span className="text-xs text-slate-500">{zone.name}</span>
                  </div>
                  <div className="text-lg font-semibold text-slate-800">{count}</div>
                  <div className="text-xs text-slate-400">{percent}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}