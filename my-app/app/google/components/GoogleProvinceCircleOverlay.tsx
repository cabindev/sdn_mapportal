// app/google/components/GoogleProvinceCircleOverlay.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Circle, OverlayView } from "@react-google-maps/api";
import { DocumentWithCategory } from "@/app/types/document";

interface GoogleProvinceCircleOverlayProps {
  currentProvince: string;
  currentLocation: { lat: number; lng: number };
  documents: DocumentWithCategory[];
  map: google.maps.Map | null;
}

export default function GoogleProvinceCircleOverlay({
  currentProvince,
  currentLocation,
  documents,
  map,
}: GoogleProvinceCircleOverlayProps) {
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

  // Circle options
  const circleOptions = {
    strokeColor: "#3B82F6",
    strokeOpacity: 0.6,
    strokeWeight: 2,
    fillColor: "#3B82F6",
    fillOpacity: 0.08,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: 25000, // 25 km
    zIndex: 1,
  };

  return (
    <>
      {/* วงกลมแสดงพื้นที่จังหวัด */}
      <Circle
        center={currentLocation}
        radius={25000}
        options={circleOptions}
      />

      {/* Label แสดงข้อมูลกลางวงกลม */}
      <OverlayView
        position={currentLocation}
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      >
        <div
          style={{
            background: provinceStats.hasData
              ? "linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)"
              : "linear-gradient(135deg, rgba(251, 191, 36, 0.95) 0%, rgba(245, 158, 11, 0.95) 100%)",
            color: "white",
            padding: "12px 20px",
            borderRadius: "12px",
            fontWeight: 600,
            textAlign: "center",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            border: "2px solid white",
            backdropFilter: "blur(10px)",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: "16px", marginBottom: "4px" }}>
            📍 {currentProvince}
          </div>
          <div style={{ fontSize: "13px", opacity: 0.95 }}>
            {provinceStats.hasData
              ? `${provinceStats.totalDocuments} เอกสาร • ${provinceStats.categoryCount} หมวดหมู่`
              : "⚠️ ยังไม่มีข้อมูลในจังหวัดนี้"
            }
          </div>
        </div>
      </OverlayView>
    </>
  );
}
