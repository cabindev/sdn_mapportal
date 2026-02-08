// app/dashboard/map/components/MapMarker.tsx
'use client'

import { Marker, useMap } from 'react-leaflet'
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
  const [showPopup, setShowPopup] = useState(false);
  const map = useMap();

  // ติดตามการเปลี่ยนแปลงระดับการซูม
  useEffect(() => {
    const handleZoom = () => {
      const zoomLevel = map.getZoom();
      const newSize = Math.max(16, Math.min(28, 8 + zoomLevel * 1.5));
      setMarkerSize(newSize);
    };

    // Set initial size based on current zoom
    handleZoom();

    // Add event listener
    map.on('zoom', handleZoom);

    // Cleanup function to remove event listener
    return () => {
      map.off('zoom', handleZoom);
    };
  }, [map]);
  
  // สร้าง icon สำหรับมาร์กเกอร์
  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('leaflet').then(L => {
      const dotSize = markerSize;

      const newIcon = L.default.divIcon({
        html: `
          <div style="position: relative; width: ${dotSize}px; height: ${dotSize}px;">
            ${docData.isLatest ? `
              <div class="marker-pulse-ring" style="
                position: absolute;
                top: 0;
                left: 0;
                width: ${dotSize}px;
                height: ${dotSize}px;
                border-radius: 50%;
                border: 3px solid ${colorScheme.primary};
              "></div>
            ` : ''}
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              width: ${dotSize}px;
              height: ${dotSize}px;
              background-color: ${colorScheme.primary};
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>
          </div>
        `,
        className: 'custom-marker-container',
        iconSize: [dotSize, dotSize],
        iconAnchor: [dotSize / 2, dotSize / 2],
        popupAnchor: [0, -dotSize / 2]
      });

      // เพิ่ม animation สำหรับ pulse effect
      const styleId = 'map-marker-animations';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          @keyframes marker-pulse {
            0%, 100% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.5); opacity: 0.3; }
          }
          .custom-marker-container {
            background: transparent !important;
            border: none !important;
          }
          .marker-pulse-ring {
            animation: marker-pulse 1.5s ease-in-out infinite;
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
        bubblingMouseEvents={false}
        eventHandlers={{
          click: togglePopup,
          mouseover: handleMouseOver,
          mouseout: handleMouseOut
        }}
      />

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