// app/dashboard/map/components/ProvinceMarkers.tsx
import { useEffect, useState } from 'react';
import { Marker, useMap, Tooltip } from 'react-leaflet';
import { provinceCoordinates } from '@/app/utils/provinceCoordinates';
import L from 'leaflet';

interface ProvinceMarkersProps {
  onSelectProvince?: (provinceName: string, color: string) => void;
}

// สีของแต่ละภูมิภาค
const regionColors: Record<string, string> = {
  "กรุงเทพมหานคร": "#E91E63",
  "เหนือบน": "#4CAF50", "เหนือล่าง": "#8BC34A",
  "อีสานบน": "#FF9800", "อีสานล่าง": "#FFC107",
  "กลาง": "#9C27B0", "ตะวันออก": "#00BCD4", "ตะวันตก": "#795548",
  "ใต้บน": "#2196F3", "ใต้ล่าง": "#3F51B5"
};

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

function getProvinceColor(provinceName: string): string {
  const region = provinceToRegion[provinceName];
  return region ? regionColors[region] : "#F97316";
}

export default function ProvinceMarkers({ onSelectProvince }: ProvinceMarkersProps) {
  const [showMarkers, setShowMarkers] = useState(false);
  const [provinceIcon, setProvinceIcon] = useState<L.DivIcon | null>(null);
  const map = useMap();
  
  // สร้าง icon สำหรับจุดจังหวัด (ขยายให้คลิกง่ายขึ้น)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const icon = L.divIcon({
        html: `
          <div style="
            width: 12px;
            height: 12px;
            background-color: rgba(255, 149, 0, 0.8);
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 6px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s ease;
          " onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"></div>
        `,
        className: 'custom-marker province-marker',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      setProvinceIcon(icon);
    }
  }, []);
  
  // ติดตามการเปลี่ยนแปลงระดับการซูม
  useEffect(() => {
    function updateMarkerVisibility() {
      setShowMarkers(map.getZoom() >= 7);
    }
    
    map.on('zoomend', updateMarkerVisibility);
    updateMarkerVisibility(); // เช็คครั้งแรก
    
    return () => {
      map.off('zoomend', updateMarkerVisibility);
    };
  }, [map]);
  
  if (!showMarkers || !provinceIcon) return null;

  // ฟังก์ชัน zoom ไปที่จังหวัด พร้อมแสดง highlight
  const handleProvinceClick = (province: typeof provinceCoordinates[0]) => {
    if (onSelectProvince) {
      const color = getProvinceColor(province.province);
      onSelectProvince(province.province, color);
    } else {
      // fallback ถ้าไม่มี onSelectProvince
      map.flyTo(
        [province.latitude, province.longitude],
        10,
        { duration: 1.2 }
      );
    }
  };

  return (
    <>
      {provinceCoordinates.map((province, index) => (
        <Marker
          key={index}
          position={[province.latitude, province.longitude]}
          icon={provinceIcon}
          eventHandlers={{
            click: () => handleProvinceClick(province)
          }}
        >
          <Tooltip
            direction="top"
            offset={[0, -5]}
            opacity={0.9}
            className="province-tooltip"
          >
            <span className="text-xs font-medium">{province.province}</span>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}