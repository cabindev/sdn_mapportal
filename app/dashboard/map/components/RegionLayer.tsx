// app/dashboard/map/components/RegionLayer.tsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { getProvinceHealthZone, getThaiZoneName } from '@/app/utils/healthZones';
// นำเข้าข้อมูล GeoJSON
import thailandGeoJson from '@/app/data/thailand.json';

// สีสำหรับแต่ละโซน - ปรับให้สดใสแต่โปร่งแสงมากขึ้น
const zoneColors = {
  "north-upper": "#FFD40030", // สีเหลืองโปร่งใส
  "north-lower": "#FF773330", // สีส้มโปร่งใส
  "northeast-upper": "#FF165430", // สีแดงอ่อนโปร่งใส
  "northeast-lower": "#D9036830", // สีแดงเข้มโปร่งใส
  "central": "#65B89130", // สีเขียวโปร่งใส
  "east": "#247BA030", // สีน้ำเงินโปร่งใส
  "west": "#05D9E830", // สีฟ้าโปร่งใส
  "south-upper": "#99E1D930", // สีเขียวอ่อนโปร่งใส
  "south-lower": "#00814830", // สีเขียวเข้มโปร่งใส
  "bangkok": "#20202030" // สีดำโปร่งใส
};

// สีสำหรับเส้นขอบ - ใช้สีเข้มชัดเจน
const zoneStrokeColors = {
  "north-upper": "#FFD400", 
  "north-lower": "#FF7733",
  "northeast-upper": "#FF1654",
  "northeast-lower": "#D90368",
  "central": "#65B891",
  "east": "#247BA0",
  "west": "#05D9E8",
  "south-upper": "#99E1D9",
  "south-lower": "#008148",
  "bangkok": "#202020"
};

const RegionLayer = () => {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    // กำหนดค่าสไตล์สำหรับแต่ละจังหวัด
    const getFeatureStyle = (feature: any) => {
      const provinceName = feature.properties.name_th;
      // ดึงข้อมูลว่าจังหวัดนี้อยู่ในโซนใด
      const zone = getProvinceHealthZone(provinceName);
      
      return {
        fillColor: zoneColors[zone] || "#cccccc20", // สีพื้นหลัง
        weight: 1.5, // เพิ่มความหนาของเส้นขอบเล็กน้อย
        opacity: 0.8, // เพิ่มความทึบของเส้นขอบเล็กน้อย
        color: zoneStrokeColors[zone] || "#cccccc", // สีเส้นขอบ
        dashArray: '2', // ปรับรูปแบบเส้นประให้ถี่ขึ้น
        fillOpacity: 0.5 // ปรับความโปร่งใสให้พอดี
      };
    };
    
    // สร้างเลเยอร์ GeoJSON
    const regionLayer = L.geoJSON(thailandGeoJson as any, {
      style: getFeatureStyle,
      onEachFeature: (feature, layer) => {
        // เพิ่ม tooltip เมื่อเลื่อนเมาส์ผ่านจังหวัด
        const provinceName = feature.properties.name_th;
        const zone = getProvinceHealthZone(provinceName);
        const zoneName = getThaiZoneName(zone);
        
        layer.bindTooltip(`<div class="text-xs font-medium p-1">
          <div>${provinceName}</div>
          <div class="text-slate-500">โซน${zoneName}</div>
        </div>`, {
          direction: 'top',
          className: 'custom-tooltip'
        });
      }
    });
    
    // เพิ่มเลเยอร์ลงในแผนที่
    regionLayer.addTo(map);
    
    // คืนค่าเพื่อล้างเลเยอร์เมื่อ component unmount
    return () => {
      map.removeLayer(regionLayer);
    };
  }, [map]);
  
  return null; // Component นี้ไม่ได้แสดง UI โดยตรง
};

export default RegionLayer;