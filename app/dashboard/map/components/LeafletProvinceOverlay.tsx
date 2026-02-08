// app/dashboard/map/components/LeafletProvinceOverlay.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import thailandGeoJSON from "@/app/data/thailand.json";

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

// Ray-casting point-in-polygon (GeoJSON coordinates = [lng, lat])
function pointInPolygon(lat: number, lng: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][1], yi = ring[i][0];
    const xj = ring[j][1], yj = ring[j][0];
    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// หาจังหวัดจากพิกัด
function findProvinceAtPoint(lat: number, lng: number): { name: string; color: string } | null {
  const features = (thailandGeoJSON as GeoJSON.FeatureCollection).features;
  for (const feature of features) {
    const name = feature.properties?.name_th;
    if (!name) continue;
    const geom = feature.geometry;
    if (geom.type === 'Polygon') {
      if (pointInPolygon(lat, lng, (geom.coordinates as number[][][])[0])) {
        return { name, color: getProvinceColor(name) };
      }
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates as number[][][][]) {
        if (pointInPolygon(lat, lng, poly[0])) {
          return { name, color: getProvinceColor(name) };
        }
      }
    }
  }
  return null;
}

interface LeafletProvinceOverlayProps {
  showOverlay?: boolean;
  onSelectProvince?: (provinceName: string, color: string) => void;
}

export default function LeafletProvinceOverlay({
  showOverlay = true,
  onSelectProvince
}: LeafletProvinceOverlayProps) {
  const map = useMap();
  const onSelectProvinceRef = useRef(onSelectProvince);
  onSelectProvinceRef.current = onSelectProvince;
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const hoveredLayerRef = useRef<L.Path | null>(null);
  const [paneReady, setPaneReady] = useState(false);

  // สร้าง custom pane ที่ pointer-events: none (ไม่บดบัง marker)
  useEffect(() => {
    if (!map) return;
    if (!map.getPane('provinceOverlay')) {
      map.createPane('provinceOverlay');
      const pane = map.getPane('provinceOverlay')!;
      pane.style.zIndex = '300';
      pane.style.pointerEvents = 'none';
    }
    setPaneReady(true);
  }, [map]);

  // Map click → point-in-polygon → province selection
  useEffect(() => {
    if (!map || !showOverlay) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!onSelectProvinceRef.current) return;
      const result = findProvinceAtPoint(e.latlng.lat, e.latlng.lng);
      if (result) {
        onSelectProvinceRef.current(result.name, result.color);
      }
    };

    map.on('click', handleMapClick);
    return () => { map.off('click', handleMapClick); };
  }, [map, showOverlay]);

  // Hover ด้วย mousemove (เพราะ pane มี pointer-events: none)
  useEffect(() => {
    if (!map || !showOverlay) return;

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      if (!geoJsonLayerRef.current) return;

      const result = findProvinceAtPoint(e.latlng.lat, e.latlng.lng);

      // Reset previous hover
      if (hoveredLayerRef.current) {
        hoveredLayerRef.current.setStyle(geoJsonStyle);
        hoveredLayerRef.current = null;
      }

      if (!result) return;

      // หา layer ที่ตรงกับจังหวัด
      geoJsonLayerRef.current.eachLayer((layer: any) => {
        if (layer.feature?.properties?.name_th === result.name) {
          layer.setStyle({
            fillColor: result.color,
            fillOpacity: 0.2,
            color: result.color,
            opacity: 0.8,
            weight: 2
          });
          hoveredLayerRef.current = layer;
        }
      });
    };

    map.on('mousemove', handleMouseMove);
    return () => { map.off('mousemove', handleMouseMove); };
  }, [map, showOverlay]);

  // Style เริ่มต้น (โปร่งใส)
  const geoJsonStyle: L.PathOptions = {
    fillColor: 'transparent',
    fillOpacity: 0,
    color: '#e5e7eb',
    opacity: 0.2,
    weight: 1
  };

  if (!showOverlay || !paneReady) {
    return null;
  }

  return (
    <GeoJSON
      ref={(ref) => { geoJsonLayerRef.current = ref as unknown as L.GeoJSON; }}
      data={thailandGeoJSON as any}
      style={geoJsonStyle}
      pane="provinceOverlay"
    />
  );
}