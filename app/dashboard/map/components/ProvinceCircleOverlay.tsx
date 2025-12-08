// app/dashboard/map/components/ProvinceCircleOverlay.tsx
"use client";

import { useEffect, useMemo } from "react";
import { Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { DocumentWithCategory } from "@/app/types/document";

interface ProvinceCircleOverlayProps {
  currentProvince: string;
  currentLocation: { lat: number; lng: number };
  documents: DocumentWithCategory[];
}

export default function ProvinceCircleOverlay({
  currentProvince,
  currentLocation,
  documents,
}: ProvinceCircleOverlayProps) {
  const map = useMap();

  // คำนวณสถิติจังหวัด
  const provinceStats = useMemo(() => {
    const provinceDocuments = documents.filter(
      (doc: any) => doc.province === currentProvince
    );
    const categoryCount = new Set(
      provinceDocuments.map((doc) => doc.categoryId)
    ).size;

    return {
      totalDocuments: provinceDocuments.length,
      categoryCount,
      hasData: provinceDocuments.length > 0,
    };
  }, [documents, currentProvince]);

  useEffect(() => {
    if (!map || !currentLocation || !currentProvince) return;

    // สร้าง custom marker แสดงข้อมูลกลางวงกลม
    const labelIcon = L.divIcon({
      className: "province-label-marker",
      html: `
        <div style="
          background: linear-gradient(135deg, ${provinceStats.hasData ? 'rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95)' : 'rgba(251, 191, 36, 0.95) 0%, rgba(245, 158, 11, 0.95)'} 100%);
          color: white;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          text-align: center;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 2px solid white;
          backdrop-filter: blur(10px);
        ">
          <div style="font-size: 16px; margin-bottom: 4px;">📍 ${currentProvince}</div>
          <div style="font-size: 13px; opacity: 0.95;">
            ${provinceStats.hasData
              ? `${provinceStats.totalDocuments} เอกสาร • ${provinceStats.categoryCount} หมวดหมู่`
              : '⚠️ ยังไม่มีข้อมูลในจังหวัดนี้'
            }
          </div>
        </div>
      `,
      iconSize: [220, 60],
      iconAnchor: [110, 30],
    });

    const labelMarker = L.marker([currentLocation.lat, currentLocation.lng], {
      icon: labelIcon,
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(map);

    return () => {
      map.removeLayer(labelMarker);
    };
  }, [map, currentLocation, currentProvince, provinceStats]);

  // วงกลมแสดงพื้นที่จังหวัด (radius ประมาณ 25-30 km)
  return (
    <Circle
      center={[currentLocation.lat, currentLocation.lng]}
      radius={25000} // 25 km
      pathOptions={{
        color: "#3B82F6",
        fillColor: "#3B82F6",
        fillOpacity: 0.08,
        weight: 2,
        opacity: 0.6,
        dashArray: "10, 10",
      }}
    />
  );
}
