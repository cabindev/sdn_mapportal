// app/dashboard/map/components/MapMarker.tsx
'use client'

import { Marker, Popup, CircleMarker, useMap } from 'react-leaflet'
import { DocumentWithCategory } from '@/app/types/document'
import { getCategoryColor } from '@/app/utils/colorGenerator'
import { useEffect, useState } from 'react'

interface MapMarkerProps {
  document: DocumentWithCategory & { isLatest?: boolean };
}

export default function MapMarker({ document: docData }: MapMarkerProps) {
  // สร้าง colorScheme ครั้งเดียวตั้งแต่ต้น และใช้ categoryId เดียวกันให้ทั้งป๊อปอัพและมาร์กเกอร์
  const colorScheme = getCategoryColor(docData.categoryId);
  const [icon, setIcon] = useState<any>(null);
  const [viewCount, setViewCount] = useState(docData.viewCount);
  const [downloadCount, setDownloadCount] = useState(docData.downloadCount);
  const map = useMap();
  
  // สร้าง icon สำหรับมาร์กเกอร์ (ไม่แสดงเลข ID)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    import('leaflet').then(L => {
      const newIcon = L.default.divIcon({
        html: `
          <div style="position: relative;">
            <div style="
              width: 28px;
              height: 28px;
              background-color: ${colorScheme.primary}; /* ใช้สีจาก colorScheme.primary โดยตรง */
              border-radius: 50%;
              border: 3px solid white;
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
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });
      
      // เพิ่ม animation สำหรับ pulse effect
      const style = document.createElement('style');
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
      
      setIcon(newIcon);
      
      return () => {
        document.head.removeChild(style);
      };
    });
  }, [docData.isLatest, colorScheme.primary]);
  
  // ฟังก์ชันเพิ่มจำนวนการดู
  const handleViewDocument = async () => {
    try {
      // เรียกใช้ API สำหรับเพิ่มจำนวนการดู
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
      // เรียกใช้ API สำหรับเพิ่มจำนวนการดาวน์โหลด
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
  
  // ฟังก์ชันเปิดป๊อปอัพแบบ modal
  const handleMarkerClick = () => {
    // พิมพ์ค่าสีเพื่อตรวจสอบความถูกต้อง
    console.log('Marker color:', colorScheme.primary);
    
    const backdrop = document.querySelector('.map-backdrop-overlay') as HTMLElement;
    if (!backdrop) {
      // สร้าง backdrop overlay ถ้ายังไม่มี
      const backdropOverlay = document.createElement('div');
      backdropOverlay.className = 'map-backdrop-overlay';
      document.querySelector('.leaflet-container')?.appendChild(backdropOverlay);
      
      // เพิ่ม CSS
      const style = document.createElement('style');
      style.innerHTML = `
        .map-backdrop-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 999;
          display: none;
        }
        
        .popup-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          max-width: 90vw;
          width: 480px;
          max-height: 90vh;
          background: white;
          border-radius: 12px;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          z-index: 1000;
          display: none;
          animation: popup-fade-in 0.3s ease;
        }
        
        @keyframes popup-fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -48%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        
        .popup-active {
          display: block;
        }
      `;
      document.head.appendChild(style);
    }
    
    if (backdrop) {
      backdrop.style.display = 'block';
    }
    
    // สร้าง popup container
    const popupContainer = document.createElement('div');
    popupContainer.className = 'popup-container popup-active';
    
    const coverImageUrl = docData.coverImage || '';
    const primaryColor = colorScheme.primary; // ใช้สีเดียวกับมาร์กเกอร์
    
    // กำหนด styles ที่ใช้ในป๊อปอัพโดยตรง
    const popupStyles = `
      <style>
        .popup-header {
          position: relative;
          height: 180px;
          background-color: ${primaryColor}20;
          overflow: hidden;
        }
        
        .popup-category-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background-color: ${primaryColor};
          color: white;
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
        }
        
        .popup-close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.25);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          z-index: 10;
          border: none;
          outline: none;
        }
        
        .popup-content {
          padding: 20px;
        }
        
        .popup-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #333;
        }
        
        .popup-date {
          display: flex;
          align-items: center;
          color: #666;
          font-size: 13px;
          margin-bottom: 15px;
        }
        
        .popup-desc {
          margin-bottom: 15px;
          font-size: 13px;
          color: #555;
          line-height: 1.5;
        }
        
        .popup-location {
          background-color: ${primaryColor}10;
          border-left: 3px solid ${primaryColor};
          padding: 12px;
          margin-bottom: 15px;
          border-radius: 4px;
        }
        
        .popup-location-title {
          font-weight: 500;
          color: ${primaryColor};
          font-size: 13px;
          margin-bottom: 4px;
        }
        
        .popup-location-text {
          color: #666;
          font-size: 13px;
        }
        
        .popup-stats {
          display: flex;
          font-size: 12px;
          color: #777;
          border-top: 1px solid #eee;
          padding-top: 15px;
        }
        
        .popup-stat {
          display: flex;
          align-items: center;
          margin-right: 15px;
        }
        
        .popup-actions {
          display: flex;
          gap: 8px;
          margin-top: 15px;
        }
        
        .popup-btn {
          flex: 1;
          padding: 10px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        
        .popup-btn-primary {
          background-color: ${primaryColor};
          color: white;
        }
        
        .popup-btn-primary:hover {
          background-color: ${primaryColor}DD;
        }
        
        .popup-btn-secondary {
          background-color: #f1f1f1;
          color: #555;
        }
        
        .popup-btn-secondary:hover {
          background-color: #e5e5e5;
        }
      </style>
    `;
    
    popupContainer.innerHTML = `
      ${popupStyles}
      <div class="popup-header">
        ${coverImageUrl ? `
          <img src="${coverImageUrl}" alt="${docData.title}" style="width: 100%; height: 100%; object-fit: cover;">
        ` : `
          <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
            <div style="
              width: 100px;
              height: 100px;
              border-radius: 50%;
              background-color: ${primaryColor};
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: white;
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            ">
              <div style="font-size: 20px; font-weight: bold;">เอกสาร</div>
              <div style="font-size: 12px;">${docData.category?.name?.substring(0, 3) || ''}</div>
            </div>
          </div>
        `}
        <div class="popup-category-badge">${docData.category?.name || 'ไม่ระบุหมวดหมู่'}</div>
        <button class="popup-close-btn">×</button>
      </div>
      <div class="popup-content">
        <h3 class="popup-title">${docData.title}</h3>
        
        <div class="popup-date">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          ${new Date(docData.createdAt).toLocaleString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
        
        ${docData.description ? `
          <div class="popup-desc">
            ${docData.description.length > 200 
              ? `${docData.description.substring(0, 200)}...` 
              : docData.description
            }
          </div>
        ` : ''}
        
        <div class="popup-location">
          <div class="popup-location-title">ตำแหน่งที่ตั้ง</div>
          <div class="popup-location-text">
            ${docData.district}, ${docData.amphoe}, ${docData.province}
          </div>
        </div>
        
        <div class="popup-stats">
          <div class="popup-stat">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            จำนวนการดู: ${viewCount}
          </div>
          <div class="popup-stat">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            ดาวน์โหลด: ${downloadCount}
          </div>
        </div>
        
        <div class="popup-actions">
          <a 
            href="${docData.filePath}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="popup-btn popup-btn-primary view-document-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            ดูเอกสาร
          </a>
          <a 
            href="${docData.filePath}?download=true" 
            download 
            class="popup-btn popup-btn-secondary download-document-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            ดาวน์โหลด
          </a>
        </div>
      </div>
    `;
    
    document.body.appendChild(popupContainer);
    
    // เพิ่ม event listener สำหรับปุ่มปิด
    const closeBtn = popupContainer.querySelector('.popup-close-btn');
    closeBtn?.addEventListener('click', () => {
      popupContainer.remove();
      if (backdrop) {
        backdrop.style.display = 'none';
      }
    });
    
    // เพิ่ม event listener สำหรับปุ่มดูเอกสาร
    const viewBtn = popupContainer.querySelector('.view-document-btn');
    viewBtn?.addEventListener('click', handleViewDocument);
    
    // เพิ่ม event listener สำหรับปุ่มดาวน์โหลด
    const downloadBtn = popupContainer.querySelector('.download-document-btn');
    downloadBtn?.addEventListener('click', handleDownload);
    
    // ปิดป๊อปอัพเมื่อคลิกที่ backdrop
    backdrop?.addEventListener('click', () => {
      popupContainer.remove();
      if (backdrop) {
        backdrop.style.display = 'none';
      }
    });
  };
  
  // รอให้ icon ถูกสร้างเสร็จก่อนแสดงผล
  if (!icon) return null;
  
  return (
    <>
      <Marker
        position={[docData.latitude, docData.longitude]}
        icon={icon}
        eventHandlers={{
          click: handleMarkerClick
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
          radius={25}
        />
      )}
    </>
  );
}