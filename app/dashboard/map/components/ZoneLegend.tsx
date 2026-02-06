// app/dashboard/map/components/ZoneLegend.tsx
import React from 'react';

const zones = [
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

export default function ZoneLegend() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {zones.map(zone => (
        <div key={zone.code} className="flex items-center p-1.5 bg-white rounded-md shadow-sm border border-slate-200">
          <span 
            className="w-4 h-4 rounded-sm mr-2 flex-shrink-0 border border-slate-300"
            style={{ backgroundColor: `${zone.color}30` }}
          ></span>
          <span className="text-sm text-slate-700">{zone.name}</span>
        </div>
      ))}
    </div>
  );
}