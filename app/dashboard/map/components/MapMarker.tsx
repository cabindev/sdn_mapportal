// app/dashboard/map/components/MapMarker.tsx
'use client'

import { Marker, CircleMarker, useMap, useMapEvent } from 'react-leaflet'
import { DocumentWithCategory } from '@/app/types/document'
import { getCategoryColor } from '@/app/utils/colorGenerator'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import DocumentPopup from './DocumentPopup'

interface MapMarkerProps {
  document: DocumentWithCategory & { isLatest?: boolean };
  onHover?: (documentId: number | null) => void;
}

export default function MapMarker({ document: docData, onHover }: MapMarkerProps) {
  const colorScheme = getCategoryColor(docData.categoryId);
  const [icon, setIcon] = useState<any>(null);
  const [viewCount, setViewCount] = useState(docData.viewCount || 0);
  const [downloadCount, setDownloadCount] = useState(docData.downloadCount || 0);
  const [markerSize, setMarkerSize] = useState(16);
  const [circleRadius, setCircleRadius] = useState(14);
  const [showPopup, setShowPopup] = useState(false);
  const map = useMap();
  
  // ติดตามการเปลี่ยนแปลงระดับการซูม
  useMapEvent('zoom', () => {
    const zoomLevel = map.getZoom();
    const newSize = Math.max(10, Math.min(16, 6 + zoomLevel * 0.8));
    const newRadius = Math.max(10, Math.min(14, 4 + zoomLevel * 0.8));
    
    setMarkerSize(newSize);
    setCircleRadius(newRadius);
  });
  
  // สร้าง icon สำหรับมาร์กเกอร์
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    import('leaflet').then(L => {
      const newIcon = L.default.divIcon({
        html: `
          <div style="position: relative;">
            <div style="
              width: ${markerSize}px;
              height: ${markerSize}px;
              background-color: ${colorScheme.primary};
              border-radius: 50%;
              border: ${markerSize > 12 ? 2 : 1}px solid white;
              box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            "></div>
            ${docData.isLatest ? `
              <div style="
                position: absolute;
                top: -4px;
                left: -4px;
                right: -4px;
                bottom: -4px;
                border-radius: 50%;
                border: 2px solid ${colorScheme.primary};
                opacity: 0.7;
                animation: pulse 1.5s infinite;
              "></div>
            ` : ''}
          </div>
        `,
        className: 'custom-marker',
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize/2, markerSize/2],
        popupAnchor: [0, -markerSize/2]
      });
      
      // เพิ่ม animation สำหรับ pulse effect
      const styleId = 'map-marker-animations';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 0.7;
            }
            50% {
              transform: scale(1.25);
              opacity: 0.5;
            }
            100% {
              transform: scale(1);
              opacity: 0.7;
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      setIcon(newIcon);
    });
  }, [docData.isLatest, colorScheme.primary, markerSize]);
  
  // ฟังก์ชันเพิ่มจำนวนการดู
  const handleViewDocument = async () => {
    try {
      const response = await fetch(`/api/documents/view/${docData.id}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setViewCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };
  
  // ฟังก์ชันเพิ่มจำนวนการดาวน์โหลด
  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/documents/download/${docData.id}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setDownloadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  };
  
  // ฟังก์ชันโหลดข้อมูลล่าสุดจากฐานข้อมูล
  const fetchLatestCounts = async () => {
    try {
      const response = await fetch(`/api/documents/${docData.id}`);
      if (response.ok) {
        const data = await response.json();
        setViewCount(data.viewCount || 0);
        setDownloadCount(data.downloadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching latest counts:', error);
    }
  };

  // เปิด/ปิด popup พร้อมป้องกัน event propagation
  const togglePopup = async (e: any) => {
    // ป้องกัน event ไปที่ map click handler
    if (e && e.originalEvent) {
      e.originalEvent.stopPropagation();
    }
    
    if (!showPopup) {
      // เมื่อเปิด popup ให้นับ view และโหลดข้อมูลล่าสุด
      await handleViewDocument();
      await fetchLatestCounts();
    }
    setShowPopup(!showPopup);
  };
  
  // ฟังก์ชันสำหรับ hover event
  const handleMouseOver = () => {
    if (onHover) {
      onHover(docData.id);
    }
  };
  
  const handleMouseOut = () => {
    if (onHover) {
      onHover(null);
    }
  };
  
  // รอให้ icon ถูกสร้างเสร็จก่อนแสดงผล
  if (!icon) return null;
  
  return (
    <>
      <Marker
        position={[docData.latitude, docData.longitude]}
        icon={icon}
        eventHandlers={{
          click: togglePopup,
          mouseover: handleMouseOver,
          mouseout: handleMouseOut
        }}
      />
      
      {docData.isLatest && (
        <CircleMarker
          center={[docData.latitude, docData.longitude]}
          pathOptions={{
            fillColor: 'transparent',
            color: colorScheme.primary,
            weight: 2,
            opacity: 0.6,
            dashArray: '4, 4'
          }}
          radius={circleRadius}
        />
      )}

      {/* ใช้ DocumentPopup component ที่มีอยู่แล้ว */}
      {showPopup && typeof document !== 'undefined' && createPortal(
        <DocumentPopup 
          document={{
            ...docData,
            viewCount,
            downloadCount
          }}
          onClose={() => setShowPopup(false)}
          onView={handleViewDocument}
          onDownload={handleDownload}
        />,
        document.body
      )}
    </>
  );
}