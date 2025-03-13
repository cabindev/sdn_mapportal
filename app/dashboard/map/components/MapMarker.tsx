// app/dashboard/map/components/MapMarker.tsx
'use client'

import { Marker, CircleMarker, useMap, useMapEvent } from 'react-leaflet'
import { DocumentWithCategory } from '@/app/types/document'
import { getCategoryColor } from '@/app/utils/colorGenerator'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface MapMarkerProps {
 document: DocumentWithCategory & { isLatest?: boolean };
}

interface DocumentPopupProps {
 document: DocumentWithCategory & { isLatest?: boolean; viewCount: number; downloadCount: number };
 onClose: () => void;
 onView: () => void;
 onDownload: () => void;
}

// DocumentPopup component เพื่อแสดงรายละเอียดเอกสาร
function DocumentPopup({ document, onClose, onView, onDownload }: DocumentPopupProps) {
 const colorScheme = getCategoryColor(document.categoryId);

 return (
   <>
     <div 
       className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[999]" 
       onClick={onClose}
     />
     
     <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] max-w-[90vw] max-h-[90vh] bg-white rounded-xl shadow-2xl z-[1000] overflow-hidden animate-fade-in">
       <div className="relative h-[180px]" style={{ backgroundColor: `${colorScheme.primary}20` }}>
         {document.coverImage ? (
           <img 
             src={document.coverImage} 
             alt={document.title} 
             className="w-full h-full object-cover"
           />
         ) : (
           <div className="flex items-center justify-center w-full h-full">
             <div 
               className="w-[100px] h-[100px] rounded-full flex flex-col items-center justify-center text-white shadow-lg"
               style={{ backgroundColor: colorScheme.primary }}
             >
               <div className="text-xl font-bold">เอกสาร</div>
               <div className="text-xs">{document.category?.name?.substring(0, 3) || ''}</div>
             </div>
           </div>
         )}
         
         <div 
           className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-sm font-medium shadow-md"
           style={{ backgroundColor: colorScheme.primary }}
         >
           {document.category?.name || 'ไม่ระบุหมวดหมู่'}
         </div>
         
         <button 
           className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black bg-opacity-25 text-white flex items-center justify-center text-lg"
           onClick={onClose}
         >
           ×
         </button>
       </div>
       
       <div className="p-5">
         <h3 className="text-lg font-semibold text-gray-800 mb-3">{document.title}</h3>
         
         <div className="flex items-center text-gray-600 text-sm mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <circle cx="12" cy="12" r="10"></circle>
             <polyline points="12 6 12 12 16 14"></polyline>
           </svg>
           {new Date(document.createdAt).toLocaleString('th-TH', {
             day: 'numeric',
             month: 'short',
             year: 'numeric',
             hour: '2-digit',
             minute: '2-digit'
           })}
         </div>
         
         {document.description && (
           <div className="text-sm text-gray-600 mb-4">
             {document.description.length > 200 
               ? `${document.description.substring(0, 200)}...` 
               : document.description
             }
           </div>
         )}
         
         <div className="rounded p-3 mb-4" style={{ 
           backgroundColor: `${colorScheme.primary}10`,
           borderLeft: `3px solid ${colorScheme.primary}` 
         }}>
           <div className="font-medium text-sm mb-1" style={{ color: colorScheme.primary }}>
             ตำแหน่งที่ตั้ง
           </div>
           <div className="text-sm text-gray-600">
             {document.district}, {document.amphoe}, {document.province}
           </div>
           <div className="text-xs text-gray-500 mt-1">
             พิกัด: {document.latitude.toFixed(6)}, {document.longitude.toFixed(6)}
           </div>
         </div>
         
         <div className="flex text-xs text-gray-500 pt-3 border-t border-gray-200">
           <div className="flex items-center mr-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
               <circle cx="12" cy="12" r="3"></circle>
             </svg>
             จำนวนการดู: {document.viewCount}
           </div>
           <div className="flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
               <polyline points="7 10 12 15 17 10"></polyline>
               <line x1="12" y1="15" x2="12" y2="3"></line>
             </svg>
             ดาวน์โหลด: {document.downloadCount}
           </div>
         </div>
         
         <div className="flex gap-2 mt-4">
           <a 
             href={document.filePath}
             target="_blank"
             rel="noopener noreferrer"
             className="flex-1 flex items-center justify-center py-2.5 px-4 bg-white border-2 rounded-md text-black font-bold text-sm hover:bg-gray-50 transition-colors"
             style={{ borderColor: colorScheme.primary }}
             onClick={(e) => {
               e.preventDefault();
               onView();
               window.open(document.filePath, '_blank');
             }}
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
               <circle cx="12" cy="12" r="3"></circle>
             </svg>
             ดูเอกสาร
           </a>
           <a 
             href={`${document.filePath}?download=true`}
             download
             className="flex-1 flex items-center justify-center py-2.5 px-4 bg-gray-200 border-2 border-gray-300 rounded-md text-black font-bold text-sm hover:bg-gray-300 transition-colors"
             onClick={() => {
               onDownload();
             }}
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
               <polyline points="7 10 12 15 17 10"></polyline>
               <line x1="12" y1="15" x2="12" y2="3"></line>
             </svg>
             ดาวน์โหลด
           </a>
         </div>
       </div>
     </div>
   </>
 );
}

export default function MapMarker({ document: docData }: MapMarkerProps) {
 const colorScheme = getCategoryColor(docData.categoryId);
 const [icon, setIcon] = useState<any>(null);
 const [viewCount, setViewCount] = useState(docData.viewCount);
 const [downloadCount, setDownloadCount] = useState(docData.downloadCount);
 const [showPopup, setShowPopup] = useState(false);
 const [markerSize, setMarkerSize] = useState(28); // ขนาดเริ่มต้น
 const [circleRadius, setCircleRadius] = useState(25); // รัศมีเริ่มต้น
 const map = useMap();
 
 // ติดตามการเปลี่ยนแปลงระดับการซูม
 useMapEvent('zoom', () => {
   const zoomLevel = map.getZoom();
   // ปรับขนาดตามระดับการซูม
   const newSize = Math.max(16, Math.min(28, 8 + zoomLevel * 1.5));
   const newRadius = Math.max(15, Math.min(25, 6 + zoomLevel * 1.4));
   
   setMarkerSize(newSize);
   setCircleRadius(newRadius);
 });
 
 // สร้าง icon สำหรับมาร์กเกอร์ โดยปรับขนาดตาม markerSize
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
           0% { transform: scale(1); opacity: 0.7; }
           50% { transform: scale(1.3); opacity: 0.5; }
           100% { transform: scale(1); opacity: 0.7; }
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
   setShowPopup(true);
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
         radius={circleRadius}
       />
     )}
     
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