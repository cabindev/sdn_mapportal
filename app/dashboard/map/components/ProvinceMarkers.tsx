// app/dashboard/map/components/ProvinceMarkers.tsx
import { useEffect, useState } from 'react';
import { Marker, useMap } from 'react-leaflet';
import { provinceCoordinates } from '@/app/utils/provinceCoordinates';
import L from 'leaflet';

export default function ProvinceMarkers() {
  const [showMarkers, setShowMarkers] = useState(false);
  const [provinceIcon, setProvinceIcon] = useState<L.DivIcon | null>(null);
  const map = useMap();
  
  // สร้าง icon สำหรับจุดจังหวัด
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const icon = L.divIcon({
        html: `
          <div style="
            width: 5px;
            height: 5px;
            background-color: rgba(255, 149, 0, 0.7);
            border-radius: 50%;
            border: 1px solid white;
            box-shadow: 0 0 3px rgba(0,0,0,0.3);
          "></div>
        `,
        className: 'custom-marker',
        iconSize: [5, 5],
        iconAnchor: [2.5, 2.5],
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
  
  return (
    <>
      {provinceCoordinates.map((province, index) => (
        <Marker 
          key={index}
          position={[province.latitude, province.longitude]} 
          icon={provinceIcon}
        />
      ))}
    </>
  );
}