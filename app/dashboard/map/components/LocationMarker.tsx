// app/dashboard/map/components/LocationMarker.tsx
import { useState, useEffect } from 'react';
import { Marker, useMapEvents, Tooltip } from 'react-leaflet';
import { provinceCoordinates } from '@/app/utils/provinceCoordinates';
import L from 'leaflet';

interface LocationMarkerProps {
  onSelectLocation: (location: { lat: number; lng: number; province?: string; amphoe?: string; district?: string }) => void;
}

export default function LocationMarker({ onSelectLocation }: LocationMarkerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [provinceMarkers, setProvinceMarkers] = useState<any[]>([]);
  const [showProvinceMarkers, setShowProvinceMarkers] = useState(false);

  // เตรียม Icon สำหรับจังหวัด
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const provinceIcon = L.divIcon({
        html: `
          <div style="
            width: 8px;
            height: 8px;
            background-color: rgba(255, 149, 0, 0.7);
            border-radius: 50%;
            border: 1px solid white;
          "></div>
        `,
        className: 'custom-marker',
        iconSize: [8, 8],
        iconAnchor: [4, 4],
      });

      const markers = provinceCoordinates.map(province => ({
        position: [province.latitude, province.longitude],
        name: province.province,
        icon: provinceIcon
      }));
      
      setProvinceMarkers(markers);
    }
  }, []);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelectLocation({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        province: "รอข้อมูล",
        amphoe: "รอข้อมูล",
        district: "รอข้อมูล"
      });
    },
    zoomend() {
      const currentZoom = map.getZoom();
      setShowProvinceMarkers(currentZoom >= 7); // แสดงชื่อจังหวัดเมื่อซูมเข้าใกล้
    },
  });

  // สร้าง Icon สำหรับตำแหน่งที่เลือก
  const selectedLocationIcon = L.divIcon({
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: #FF3B30;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      "></div>
      <div style="
        position: absolute;
        top: -4px;
        left: -4px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid rgba(255,59,48,0.5);
        animation: ping 1.5s ease-in-out infinite;
      "></div>
    `,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <>
      {/* แสดงตำแหน่งที่เลือก */}
      {position && (
        <Marker position={position} icon={selectedLocationIcon}>
          <Tooltip permanent>
            <div className="text-xs font-medium">ตำแหน่งที่เลือก</div>
          </Tooltip>
        </Marker>
      )}

      {/* แสดงตำแหน่งจังหวัด */}
      {showProvinceMarkers && provinceMarkers.map((marker, idx) => (
        <Marker 
          key={idx} 
          position={marker.position} 
          icon={marker.icon}
          eventHandlers={{
            click: () => {
              onSelectLocation({
                lat: marker.position[0],
                lng: marker.position[1],
                province: marker.name,
                amphoe: "",
                district: ""
              });
              setPosition(L.latLng(marker.position[0], marker.position[1]));
            }
          }}
        >
          <Tooltip direction="top" offset={[0, -5]}>
            <div className="text-xs font-medium">{marker.name}</div>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}