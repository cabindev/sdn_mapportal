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
  const [viewCount, setViewCount] = useState(docData.viewCount);
  const [downloadCount, setDownloadCount] = useState(docData.downloadCount);
  const [markerSize, setMarkerSize] = useState(28);
  const [circleRadius, setCircleRadius] = useState(25);
  const [showPopup, setShowPopup] = useState(false);
  const map = useMap();
  
  // ติดตามการเปลี่ยนแปลงระดับการซูม
  useMapEvent('zoom', () => {
    const zoomLevel = map.getZoom();
    const newSize = Math.max(16, Math.min(28, 8 + zoomLevel * 1.5));
    const newRadius = Math.max(15, Math.min(25, 6 + zoomLevel * 1.4));
    
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
              border: ${markerSize > 20 ? 3 : 2}px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            "></div>
            ${docData.isLatest ? `
              <div style="
                position: absolute;
                top: -5px;
                left: -5px;
                right: -5px;
                bottom: -5px;
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
              transform: scale(1.3);
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
  
  // เปิด/ปิด popup
  const togglePopup = () => {
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
            dashArray: '5, 5'
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