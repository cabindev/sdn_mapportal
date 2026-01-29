// app/google/components/GoogleProvinceOverlay.tsx
"use client";

import { useEffect, useState } from 'react';

interface GoogleProvinceOverlayProps {
  map: google.maps.Map | null;
}

export default function GoogleProvinceOverlay({ map }: GoogleProvinceOverlayProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!map || isLoaded) return;

    const loadProvincePolygons = async () => {
      try {
        // ใช้ข้อมูล GeoJSON ที่ถูกต้องจาก GitHub หรือ source ที่เชื่อถือได้
        const response = await fetch('https://raw.githubusercontent.com/apisit/thailand.json/master/thailand.json');
        const geoJsonData = await response.json();
        
        console.log('📍 Loading Thailand province boundaries...');

        // โหลดข้อมูลเข้า Google Maps Data Layer
        map.data.addGeoJson(geoJsonData);
        
        // ตั้งค่า style เริ่มต้น (โปร่งใส)
        map.data.setStyle({
          fillColor: 'transparent',
          fillOpacity: 0,
          strokeColor: '#e5e7eb',
          strokeOpacity: 0.2,
          strokeWeight: 1,
          clickable: true
        });
        
        // เมื่อ hover เข้า
        map.data.addListener('mouseover', (event: google.maps.Data.MouseEvent) => {
          map.data.overrideStyle(event.feature, {
            fillColor: '#fbbf24',
            fillOpacity: 0.2,
            strokeColor: '#f59e0b',
            strokeOpacity: 0.8,
            strokeWeight: 2
          });
          
          // ไม่แสดง tooltip แค่เปลี่ยนสี
        });
        
        // เมื่อ hover ออก
        map.data.addListener('mouseout', (event: google.maps.Data.MouseEvent) => {
          map.data.revertStyle(event.feature);
        });
        
        
        setIsLoaded(true);
        console.log('✅ Province boundaries loaded successfully');
        
        // Cleanup function ไม่ต้องมีแล้ว
        
      } catch (error) {
        console.error('❌ Error loading province data:', error);
        
        // Fallback: ใช้วงกลมถ้าโหลด GeoJSON ไม่ได้
        console.log('🔄 Falling back to circle method...');
        const { provinceCoordinates } = await import('@/app/data/provinceCoordinates');
        
        provinceCoordinates.forEach(province => {
          const circle = new google.maps.Circle({
            strokeColor: 'transparent',
            strokeOpacity: 0,
            strokeWeight: 1,
            fillColor: 'transparent',
            fillOpacity: 0,
            map: map,
            center: { lat: province.latitude, lng: province.longitude },
            radius: 30000,
            clickable: true
          });

          circle.addListener('mouseover', () => {
            circle.setOptions({
              fillColor: '#fbbf24',
              fillOpacity: 0.2,
              strokeColor: '#f59e0b',
              strokeOpacity: 0.8,
              strokeWeight: 2
            });

            // ไม่แสดง tooltip แค่เปลี่ยนสี
          });

          circle.addListener('mouseout', () => {
            circle.setOptions({
              fillColor: 'transparent',
              fillOpacity: 0,
              strokeColor: 'transparent',
              strokeOpacity: 0
            });

            // ไม่ต้องลบ tooltip เพราะไม่ได้สร้าง
          });
        });
        
        setIsLoaded(true);
        console.log('✅ Fallback circles loaded');
      }
    };

    loadProvincePolygons();

  }, [map, isLoaded]);

  return null;
}