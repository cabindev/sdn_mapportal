// app/google/components/GoogleProvinceHighlight.tsx
"use client";

import { useEffect, useRef, useCallback } from 'react';
import thailandGeoJSON from "@/app/data/thailand.json";

interface GoogleProvinceHighlightProps {
  map: google.maps.Map | null;
  selectedProvince: string | null;
  selectedProvinces?: string[];
  color?: string;
  onClose?: () => void;
}

export default function GoogleProvinceHighlight({
  map,
  selectedProvince,
  selectedProvinces = [],
  color = "#F97316",
  onClose
}: GoogleProvinceHighlightProps) {
  const polygonsRef = useRef<google.maps.Polygon[]>([]);

  // รวมจังหวัดที่เลือก (ทั้งเดี่ยวและหลายจังหวัด)
  const allSelectedProvinces = selectedProvinces.length > 0
    ? selectedProvinces
    : selectedProvince
      ? [selectedProvince]
      : [];

  // ฟังก์ชันล้าง polygons
  const clearPolygons = useCallback(() => {
    polygonsRef.current.forEach(polygon => {
      polygon.setMap(null);
    });
    polygonsRef.current = [];
  }, []);

  // ฟังก์ชันแปลง GeoJSON coordinates เป็น Google Maps LatLng
  const convertCoordinates = useCallback((coordinates: number[][]): google.maps.LatLngLiteral[] => {
    return coordinates.map(coord => ({
      lat: coord[1],
      lng: coord[0]
    }));
  }, []);

  useEffect(() => {
    if (!map) return;

    // ล้าง polygons เก่า
    clearPolygons();

    if (allSelectedProvinces.length === 0) return;

    // หา features ของจังหวัดที่เลือก
    const selectedFeatures = (thailandGeoJSON as GeoJSON.FeatureCollection).features.filter(
      (f) => allSelectedProvinces.includes(f.properties?.name_th)
    );

    if (selectedFeatures.length === 0) return;

    // สร้าง polygons สำหรับแต่ละจังหวัด
    const bounds = new google.maps.LatLngBounds();

    selectedFeatures.forEach(feature => {
      const geometry = feature.geometry;

      if (geometry.type === 'Polygon') {
        const paths = convertCoordinates(geometry.coordinates[0] as number[][]);

        const polygon = new google.maps.Polygon({
          paths: paths,
          strokeColor: color,
          strokeOpacity: 0.9,
          strokeWeight: 3,
          fillColor: color,
          fillOpacity: 0.4,
          map: map,
          zIndex: 1000
        });

        polygonsRef.current.push(polygon);

        // เพิ่ม bounds
        paths.forEach(point => {
          bounds.extend(point);
        });
      } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach((polygonCoords: number[][][]) => {
          const paths = convertCoordinates(polygonCoords[0] as number[][]);

          const polygon = new google.maps.Polygon({
            paths: paths,
            strokeColor: color,
            strokeOpacity: 0.9,
            strokeWeight: 3,
            fillColor: color,
            fillOpacity: 0.4,
            map: map,
            zIndex: 1000
          });

          polygonsRef.current.push(polygon);

          // เพิ่ม bounds
          paths.forEach(point => {
            bounds.extend(point);
          });
        });
      }
    });

    // Fit bounds ให้แสดงทั้งหมด พร้อม padding สำหรับ sidebar
    if (!bounds.isEmpty()) {
      // คำนวณ padding สำหรับ sidebar ด้านซ้าย
      const padding = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 400 // หลบ sidebar
      };

      map.fitBounds(bounds, padding);

      // จำกัด zoom level
      const maxZoom = selectedProvinces.length > 1 ? 8 : 11;
      const listener = google.maps.event.addListener(map, 'idle', () => {
        const currentZoom = map.getZoom();
        if (currentZoom && currentZoom > maxZoom) {
          map.setZoom(maxZoom);
        }
        google.maps.event.removeListener(listener);
      });
    }

    // Cleanup
    return () => {
      clearPolygons();
    };
  }, [map, allSelectedProvinces, color, clearPolygons, convertCoordinates, selectedProvinces.length]);

  return null;
}
