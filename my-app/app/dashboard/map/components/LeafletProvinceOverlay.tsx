// app/dashboard/map/components/LeafletProvinceOverlay.tsx
"use client";

import { useEffect, useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

// สีของแต่ละภูมิภาค
const regionColors: Record<string, string> = {
  "กรุงเทพมหานคร": "#E91E63",
  "เหนือบน": "#4CAF50",
  "เหนือล่าง": "#8BC34A",
  "อีสานบน": "#FF9800",
  "อีสานล่าง": "#FFC107",
  "กลาง": "#9C27B0",
  "ตะวันออก": "#00BCD4",
  "ตะวันตก": "#795548",
  "ใต้บน": "#2196F3",
  "ใต้ล่าง": "#3F51B5"
};

// จังหวัดในแต่ละภูมิภาค
const provinceToRegion: Record<string, string> = {
  "กรุงเทพมหานคร": "กรุงเทพมหานคร",
  "เชียงใหม่": "เหนือบน", "เชียงราย": "เหนือบน", "ลำปาง": "เหนือบน", "ลำพูน": "เหนือบน",
  "แม่ฮ่องสอน": "เหนือบน", "น่าน": "เหนือบน", "พะเยา": "เหนือบน", "แพร่": "เหนือบน",
  "นครสวรรค์": "เหนือล่าง", "อุทัยธานี": "เหนือล่าง", "ชัยนาท": "เหนือล่าง", "กำแพงเพชร": "เหนือล่าง",
  "ตาก": "เหนือล่าง", "สุโขทัย": "เหนือล่าง", "พิษณุโลก": "เหนือล่าง", "พิจิตร": "เหนือล่าง",
  "เพชรบูรณ์": "เหนือล่าง", "อุตรดิตถ์": "เหนือล่าง",
  "ขอนแก่น": "อีสานบน", "อุดรธานี": "อีสานบน", "เลย": "อีสานบน", "หนองคาย": "อีสานบน",
  "หนองบัวลำภู": "อีสานบน", "บึงกาฬ": "อีสานบน", "นครพนม": "อีสานบน", "สกลนคร": "อีสานบน",
  "กาฬสินธุ์": "อีสานบน", "ร้อยเอ็ด": "อีสานบน", "มหาสารคาม": "อีสานบน",
  "นครราชสีมา": "อีสานล่าง", "ชัยภูมิ": "อีสานล่าง", "บุรีรัมย์": "อีสานล่าง", "สุรินทร์": "อีสานล่าง",
  "ศรีสะเกษ": "อีสานล่าง", "อุบลราชธานี": "อีสานล่าง", "ยโสธร": "อีสานล่าง", "อำนาจเจริญ": "อีสานล่าง",
  "มุกดาหาร": "อีสานล่าง",
  "ลพบุรี": "กลาง", "สิงห์บุรี": "กลาง", "อ่างทอง": "กลาง", "พระนครศรีอยุธยา": "กลาง",
  "สระบุรี": "กลาง", "ปทุมธานี": "กลาง", "นนทบุรี": "กลาง", "นครนายก": "กลาง",
  "สมุทรปราการ": "ตะวันออก", "ฉะเชิงเทรา": "ตะวันออก", "ปราจีนบุรี": "ตะวันออก", "สระแก้ว": "ตะวันออก",
  "จันทบุรี": "ตะวันออก", "ตราด": "ตะวันออก", "ระยอง": "ตะวันออก", "ชลบุรี": "ตะวันออก",
  "สมุทรสงคราม": "ตะวันตก", "สมุทรสาคร": "ตะวันตก", "นครปฐม": "ตะวันตก", "กาญจนบุรี": "ตะวันตก",
  "ราชบุรี": "ตะวันตก", "สุพรรณบุรี": "ตะวันตก", "เพชรบุรี": "ตะวันตก", "ประจวบคีรีขันธ์": "ตะวันตก",
  "ชุมพร": "ใต้บน", "ระนอง": "ใต้บน", "สุราษฎร์ธานี": "ใต้บน", "พังงา": "ใต้บน",
  "ภูเก็ต": "ใต้บน", "กระบี่": "ใต้บน", "นครศรีธรรมราช": "ใต้บน",
  "ตรัง": "ใต้ล่าง", "พัทลุง": "ใต้ล่าง", "สตูล": "ใต้ล่าง", "สงขลา": "ใต้ล่าง",
  "ปัตตานี": "ใต้ล่าง", "ยะลา": "ใต้ล่าง", "นราธิวาส": "ใต้ล่าง"
};

// ฟังก์ชันหาสีของจังหวัด
function getProvinceColor(provinceName: string): string {
  const region = provinceToRegion[provinceName];
  return region ? regionColors[region] : "#F97316";
}

interface LeafletProvinceOverlayProps {
  showOverlay?: boolean;
  onSelectProvince?: (provinceName: string, color: string) => void;
}

export default function LeafletProvinceOverlay({
  showOverlay = true,
  onSelectProvince
}: LeafletProvinceOverlayProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useCircleFallback, setUseCircleFallback] = useState(false);
  const map = useMap();

  useEffect(() => {
    if (!showOverlay || isLoaded) return;

    const loadProvinceData = async () => {
      try {
        console.log('📍 Loading Thailand province boundaries for Leaflet...');
        
        // ลองใช้ข้อมูล GeoJSON จาก GitHub ก่อน
        const response = await fetch('https://raw.githubusercontent.com/apisit/thailand.json/master/thailand.json');
        
        if (!response.ok) {
          throw new Error('Failed to fetch GeoJSON data');
        }
        
        const data = await response.json();
        setGeoJsonData(data);
        setIsLoaded(true);
        console.log('✅ Province boundaries loaded successfully for Leaflet');
        
      } catch (error) {
        console.error('❌ Error loading province data for Leaflet:', error);
        console.log('🔄 Falling back to circle method...');
        
        // Fallback: ใช้วงกลมถ้าโหลด GeoJSON ไม่ได้
        setUseCircleFallback(true);
        await createCircleFallback();
        setIsLoaded(true);
      }
    };

    const createCircleFallback = async () => {
      try {
        const { provinceCoordinates } = await import('@/app/data/provinceCoordinates');
        
        provinceCoordinates.forEach(province => {
          const circle = L.circle([province.latitude, province.longitude], {
            radius: 30000,
            color: 'transparent',
            fillColor: 'transparent',
            fillOpacity: 0,
            weight: 1
          }).addTo(map);

          // เมื่อ hover เข้า
          circle.on('mouseover', (e) => {
            circle.setStyle({
              color: '#f59e0b',
              fillColor: '#fbbf24',
              fillOpacity: 0.2,
              weight: 2
            });

            // ไม่แสดง tooltip แค่เปลี่ยนสี
          });

          // เมื่อ hover ออก
          circle.on('mouseout', () => {
            circle.setStyle({
              color: 'transparent',
              fillColor: 'transparent',
              fillOpacity: 0,
              weight: 1
            });
            // ไม่ต้องปิด tooltip เพราะไม่ได้แสดง
          });
        });
        
        console.log('✅ Fallback circles loaded for Leaflet');
      } catch (fallbackError) {
        console.error('❌ Fallback method also failed:', fallbackError);
      }
    };

    loadProvinceData();
  }, [map, showOverlay, isLoaded]);

  // Style function สำหรับ GeoJSON
  const geoJsonStyle = {
    fillColor: 'transparent',
    fillOpacity: 0,
    color: '#e5e7eb',
    opacity: 0.2,
    weight: 1
  };

  // Event handlers สำหรับ GeoJSON
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const provinceName = feature.properties?.name_th || feature.properties?.name;
    const color = getProvinceColor(provinceName);

    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          fillColor: color,
          fillOpacity: 0.3,
          color: color,
          opacity: 0.8,
          weight: 2
        });

        // แสดง tooltip ชื่อจังหวัด
        layer.bindTooltip(provinceName, {
          permanent: false,
          direction: 'center',
          className: 'province-tooltip'
        }).openTooltip();
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(geoJsonStyle);
        layer.closeTooltip();
      },
      click: () => {
        // เมื่อคลิกให้เลือกจังหวัด
        if (onSelectProvince && provinceName) {
          onSelectProvince(provinceName, color);
        }
      }
    });
  };

  if (!showOverlay || !isLoaded || useCircleFallback) {
    return null;
  }

  return geoJsonData ? (
    <GeoJSON
      data={geoJsonData}
      style={geoJsonStyle}
      onEachFeature={onEachFeature}
    />
  ) : null;
}