// app/dashboard/map/components/ProvinceHighlight.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import thailandGeoJSON from "@/app/data/thailand.json";
import { provinceCoordinates } from "@/app/utils/provinceCoordinates";
import { THAILAND_BOUNDS } from "@/app/utils/colorGenerator";

interface ProvinceHighlightProps {
  selectedProvince: string | null;
  selectedProvinces?: string[]; // รองรับหลายจังหวัด (สำหรับเลือกทั้งภูมิภาค)
  color?: string;
  onClose?: () => void;
}

// Export function เพื่อหาชื่อภาษาอังกฤษของจังหวัด
export function getProvinceEnglishName(provinceTh: string): string | null {
  const feature = (thailandGeoJSON as GeoJSON.FeatureCollection).features.find(
    (f) => f.properties?.name_th === provinceTh
  );
  return feature?.properties?.name || null;
}

export default function ProvinceHighlight({
  selectedProvince,
  selectedProvinces = [],
  color = "#F97316",
  onClose
}: ProvinceHighlightProps) {
  const map = useMap();
  const [key, setKey] = useState(0);

  // รวมจังหวัดที่เลือก (ทั้งเดี่ยวและหลายจังหวัด)
  const allSelectedProvinces = useMemo(() => {
    if (selectedProvinces.length > 0) {
      return selectedProvinces;
    }
    if (selectedProvince) {
      return [selectedProvince];
    }
    return [];
  }, [selectedProvince, selectedProvinces]);

  // หา features ของจังหวัดที่เลือกทั้งหมด
  const selectedFeatures = useMemo(() => {
    if (allSelectedProvinces.length === 0) return [];

    return (thailandGeoJSON as GeoJSON.FeatureCollection).features.filter(
      (f) => allSelectedProvinces.includes(f.properties?.name_th)
    );
  }, [allSelectedProvinces]);

  // สร้าง FeatureCollection จาก features ที่เลือก
  const featureCollection = useMemo(() => {
    if (selectedFeatures.length === 0) return null;

    return {
      type: "FeatureCollection" as const,
      features: selectedFeatures
    };
  }, [selectedFeatures]);

  // Zoom ไปที่ bounds ของจังหวัดที่เลือกทั้งหมด
  useEffect(() => {
    if (featureCollection && featureCollection.features.length > 0 && map) {
      const layer = L.geoJSON(featureCollection as any);
      const bounds = layer.getBounds();

      // ใช้ fitBounds พร้อม padding เพื่อหลบ sidebar
      map.fitBounds(bounds, {
        paddingTopLeft: [450, 20],
        paddingBottomRight: [20, 20],
        maxZoom: selectedProvinces.length > 1 ? 8 : 11, // zoom น้อยลงถ้าเลือกหลายจังหวัด
        animate: true,
        duration: 1.2
      });

      // Force re-render GeoJSON
      setKey(prev => prev + 1);
    }
    // กรณีปิดการเลือก (reset)
    else if (allSelectedProvinces.length === 0 && map) {
      map.setView(THAILAND_BOUNDS.center, THAILAND_BOUNDS.zoom, {
        animate: true,
        duration: 1.2
      });
    }
  }, [featureCollection, map, allSelectedProvinces.length, selectedProvinces.length]);

  if (!featureCollection || selectedFeatures.length === 0) return null;

  // Style สำหรับ polygon
  const style = {
    fillColor: color,
    fillOpacity: 0.4,
    color: color,
    weight: 3,
    opacity: 0.9
  };

  return (
    <GeoJSON
      key={`province-highlight-${key}-${allSelectedProvinces.join('-')}`}
      data={featureCollection}
      style={style}
    />
  );
}
