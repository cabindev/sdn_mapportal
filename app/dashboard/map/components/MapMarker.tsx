// app/dashboard/map/components/MapMarker.tsx
'use client'

import { Marker, useMap } from 'react-leaflet'
import { DocumentWithCategory } from '@/app/types/document'
import { getCategoryColor } from '@/app/utils/colorGenerator'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import DocumentPopup from './DocumentPopup'
import LocationStackList from '@/app/components/LocationStackList'

interface MapMarkerProps {
  /** เอกสารทั้งหมดที่อยู่ในพิกัดเดียวกัน (เรียงใหม่สุดก่อน) */
  documents: (DocumentWithCategory & { isLatest?: boolean })[];
  onHover?: (documentId: number | null) => void;
}

export default function MapMarker({ documents, onHover }: MapMarkerProps) {
  const primary = documents[0];
  const count = documents.length;
  const isLatest = documents.some(doc => doc.isLatest);
  const colorScheme = getCategoryColor(primary.categoryId);

  const [icon, setIcon] = useState<any>(null);
  const [markerSize, setMarkerSize] = useState(16);
  const [showList, setShowList] = useState(false);
  const [activeDoc, setActiveDoc] = useState<DocumentWithCategory | null>(null);
  const [viewCount, setViewCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
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
            ${isLatest ? `
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
            ${count > 1 ? `
              <div style="
                position: absolute;
                top: -6px;
                right: -6px;
                min-width: 16px;
                height: 16px;
                padding: 0 3px;
                box-sizing: border-box;
                background-color: #EF4444;
                color: white;
                border: 2px solid white;
                border-radius: 8px;
                font-size: 10px;
                font-weight: 700;
                line-height: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 1px 2px rgba(0,0,0,0.3);
              ">${count > 99 ? '99+' : count}</div>
            ` : ''}
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
  }, [isLatest, colorScheme.primary, markerSize, count]);

  // ฟังก์ชันเพิ่มจำนวนการดู
  const incrementViewCount = async (docId: number) => {
    try {
      const response = await fetch(`/api/documents/view/${docId}`, {
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
    if (!activeDoc) return;
    try {
      const response = await fetch(`/api/documents/download/${activeDoc.id}`, {
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
  const fetchLatestCounts = async (docId: number) => {
    try {
      const response = await fetch(`/api/documents/${docId}`);
      if (response.ok) {
        const data = await response.json();
        setViewCount(data.viewCount || 0);
        setDownloadCount(data.downloadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching latest counts:', error);
    }
  };

  // เปิด popup รายละเอียดของเอกสารที่เลือก พร้อมนับ view และโหลดข้อมูลล่าสุด
  const openDocument = async (doc: DocumentWithCategory) => {
    setShowList(false);
    setActiveDoc(doc);
    await incrementViewCount(doc.id);
    await fetchLatestCounts(doc.id);
  };

  // คลิกที่หมุด: ถ้ามีเอกสารเดียวเปิด popup เลย, ถ้าหลายเอกสารแสดงรายการให้เลือก
  const handleMarkerClick = (e: any) => {
    // ป้องกัน event ไปที่ map click handler
    if (e && e.originalEvent) {
      e.originalEvent.stopPropagation();
    }

    if (count > 1) {
      setShowList(true);
    } else {
      openDocument(primary);
    }
  };

  // ฟังก์ชันสำหรับ hover event
  const handleMouseOver = () => {
    if (onHover) {
      onHover(primary.id);
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
        position={[primary.latitude, primary.longitude]}
        icon={icon}
        bubblingMouseEvents={false}
        eventHandlers={{
          click: handleMarkerClick,
          mouseover: handleMouseOver,
          mouseout: handleMouseOut
        }}
      />

      {/* รายการเอกสารที่ซ้อนกันในจุดเดียว */}
      {showList && typeof document !== 'undefined' && createPortal(
        <LocationStackList
          documents={documents}
          onSelect={openDocument}
          onClose={() => setShowList(false)}
        />,
        document.body
      )}

      {/* popup รายละเอียดของเอกสารที่เลือก */}
      {activeDoc && typeof document !== 'undefined' && createPortal(
        <DocumentPopup
          document={{
            ...activeDoc,
            viewCount,
            downloadCount
          }}
          onClose={() => setActiveDoc(null)}
          onView={() => incrementViewCount(activeDoc.id)}
          onDownload={handleDownload}
        />,
        document.body
      )}
    </>
  );
}
