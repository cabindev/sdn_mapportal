// app/dashboard/map/components/LeafletProvinceOverlay.tsx
"use client";

import { useEffect, useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

interface LeafletProvinceOverlayProps {
  showOverlay?: boolean;
}

export default function LeafletProvinceOverlay({ showOverlay = true }: LeafletProvinceOverlayProps) {
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
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          fillColor: '#fbbf24',
          fillOpacity: 0.2,
          color: '#f59e0b',
          opacity: 0.8,
          weight: 2
        });

        // ไม่แสดง tooltip แค่เปลี่ยนสี
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(geoJsonStyle);
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