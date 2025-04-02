// app/dashboard/map/components/RecentDocumentsSidebar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { DocumentWithCategory } from "@/app/types/document";
import { getCategoryColor } from "@/app/utils/colorGenerator";
import { createPortal } from "react-dom";
import DocumentPopup from "./DocumentPopup";

interface RecentDocumentsSidebarProps {
 documents: DocumentWithCategory[];
 onHoverDocument?: (documentId: number | null) => void;
 defaultCenter?: [number, number];
 defaultZoom?: number;
}

export default function RecentDocumentsSidebar({ 
 documents: allDocuments, 
 onHoverDocument,
 defaultCenter = [13.7563, 100.5018],
 defaultZoom = 6
}: RecentDocumentsSidebarProps) {
 const map = useMap();
 const [hoveredDocId, setHoveredDocId] = useState<number | null>(null);
 const [documents, setDocuments] = useState<DocumentWithCategory[]>([]);
 const [selectedDoc, setSelectedDoc] = useState<DocumentWithCategory | null>(null);
 const [viewCount, setViewCount] = useState(0);
 const [downloadCount, setDownloadCount] = useState(0);
 const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
 const scrollContainerRef = useRef<HTMLDivElement>(null);
 const initialViewRef = useRef<{center: [number, number], zoom: number} | null>(null);
 
 // เก็บตำแหน่งและระดับซูมเริ่มต้นของแผนที่
 useEffect(() => {
   const currentCenter = map.getCenter();
   const currentZoom = map.getZoom();
   
   initialViewRef.current = {
     center: [currentCenter.lat, currentCenter.lng] as [number, number],
     zoom: currentZoom
   };
 }, [map]);
 
 // กรองเอาเฉพาะ 10 เอกสารล่าสุด
 useEffect(() => {
   const sortedDocs = [...allDocuments].sort(
     (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
   );
   setDocuments(sortedDocs.slice(0, 10));
 }, [allDocuments]);

 // ป้องกันการ zoom แผนที่เมื่อ scroll ภายใน sidebar
 useEffect(() => {
   const scrollContainer = scrollContainerRef.current;
   if (!scrollContainer) return;

   const preventZoom = (e: WheelEvent) => {
     e.stopPropagation();
   };

   scrollContainer.addEventListener('wheel', preventZoom);
   
   return () => {
     scrollContainer.removeEventListener('wheel', preventZoom);
   };
 }, []);

 // เมื่อเม้าส์ hover ที่เอกสาร - ดีเลย์การเลื่อนแผนที่เล็กน้อย
 const handleMouseEnter = (doc: DocumentWithCategory) => {
   setHoveredDocId(doc.id);
   if (onHoverDocument) {
     onHoverDocument(doc.id);
   }
   
   // ล้าง timer เดิมถ้ามี
   if (hoverTimerRef.current) {
     clearTimeout(hoverTimerRef.current);
   }
   
   // ตั้ง timer ใหม่เพื่อรอสักครู่ก่อนเลื่อนแผนที่
   hoverTimerRef.current = setTimeout(() => {
     // เลื่อนแผนที่ไปยังตำแหน่งเอกสาร
     map.flyTo([doc.latitude, doc.longitude], 12, {
       animate: true,
       duration: 1
     });
   }, 600); // รอ 600ms ก่อนเลื่อนแผนที่
 };
 
 // เมื่อเม้าส์ออกจากเอกสาร
 const handleMouseLeave = () => {
   setHoveredDocId(null);
   if (onHoverDocument) {
     onHoverDocument(null);
   }
   
   // ล้าง timer เมื่อเม้าส์ออก
   if (hoverTimerRef.current) {
     clearTimeout(hoverTimerRef.current);
     hoverTimerRef.current = null;
   }
   
   // กลับไปที่มุมมองแผนที่เริ่มต้น
   if (initialViewRef.current) {
     // ใช้ค่าที่เก็บไว้เมื่อโหลดหน้าครั้งแรก
     map.flyTo(
       initialViewRef.current.center, 
       initialViewRef.current.zoom, 
       { animate: true, duration: 1.5 }
     );
   } else {
     // ใช้ค่าเริ่มต้นที่กำหนดในพารามิเตอร์
     map.flyTo(defaultCenter, defaultZoom, { animate: true, duration: 1.5 });
   }
 };

 // เมื่อคลิกที่เอกสาร
 const handleDocumentClick = (doc: DocumentWithCategory) => {
   setSelectedDoc(doc);
   setViewCount(doc.viewCount);
   setDownloadCount(doc.downloadCount);
 };
 
 // ปิด popup
 const closePopup = () => {
   setSelectedDoc(null);
 };

 // ฟังก์ชันเพิ่มจำนวนการดู
 const handleViewDocument = async () => {
   if (!selectedDoc) return;
   
   try {
     // เรียกใช้ API สำหรับเพิ่มจำนวนการดู
     const response = await fetch(`/api/documents/view/${selectedDoc.id}`, {
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
   if (!selectedDoc) return;
   
   try {
     // เรียกใช้ API สำหรับเพิ่มจำนวนการดาวน์โหลด
     const response = await fetch(`/api/documents/download/${selectedDoc.id}`, {
       method: 'POST',
     });
     
     if (response.ok) {
       setDownloadCount(prev => prev + 1);
     }
   } catch (error) {
     console.error('Error incrementing download count:', error);
   }
 };

 // ป้องกัน scroll propagation เพิ่มเติม
 const handleWheel = (e: React.WheelEvent) => {
   e.stopPropagation();
 };
 
 return (
   <>
     <div className="absolute pt-10 top-1/2 transform -translate-y-1/2 left-24  rounded-lg shadow-lg overflow-hidden z-[900] w-80 max-h-[calc(100vh-100px)] hidden md:block">
       <div className="px-4 py-3.5 bg-blue-100 border-b border-blue-200 flex items-center justify-between">
         <h3 className="text-sm font-semibold  text-blue-800">เอกสารล่าสุด</h3>
         <span className="text-xs bg-blue-200 text-blue-700 px-2.5 py-1 rounded-full">
           {documents.length}
         </span>
       </div>  
       
       <div 
         ref={scrollContainerRef}
         className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent py-2" 
         style={{ maxHeight: 'calc(100vh - 200px)', height: 'auto' }}
         onWheel={handleWheel}
       >
         {documents.length > 0 ? (
           documents.map(doc => {
             const colorScheme = getCategoryColor(doc.categoryId);
             const isHovered = hoveredDocId === doc.id;
             
             return (
               <div 
                 key={doc.id}
                 className={`p-4 mb-1.5 border-b border-gray-200 hover:bg-slate-100 transition-colors cursor-pointer ${isHovered ? 'bg-slate-100' : ''}`}
                 onMouseEnter={() => handleMouseEnter(doc)}
                 onMouseLeave={handleMouseLeave}
                 onClick={() => handleDocumentClick(doc)}
               >
                 <div className="flex items-start gap-3">
                   {doc.coverImage ? (
                     <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden shadow-sm">
                       <img 
                         src={doc.coverImage} 
                         alt={doc.title}
                         className="w-full h-full object-cover" 
                       />
                     </div>
                   ) : (
                     <div 
                       className="flex-shrink-0 w-16 h-16 rounded-md flex items-center justify-center shadow-sm"
                       style={{ backgroundColor: `${colorScheme.primary}20` }}
                     >
                       <div 
                         className="w-10 h-10 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: colorScheme.primary }}
                       >
                         <span className="text-white text-xs font-medium">{doc.category?.name?.substring(0, 2) || ''}</span>
                       </div>
                     </div>
                   )}
                   
                   <div className="flex-1 min-w-0">
                     <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1.5" title={doc.title}>
                       {doc.title}
                     </h4>
                     
                     <div className="flex items-center text-xs text-gray-500 mb-2">
                       <span className="inline-block px-2 py-0.5 rounded-full text-xs" style={{ 
                         backgroundColor: `${colorScheme.primary}20`,
                         color: colorScheme.primary
                       }}>
                         {doc.category?.name || 'ไม่ระบุหมวดหมู่'}
                       </span>
                     </div>
                     
                     <div className="text-xs text-gray-600 flex items-center">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                       </svg>
                       {doc.district}, {doc.amphoe}, {doc.province}
                     </div>
                   </div>
                 </div>
               </div>
             );
           })
         ) : (
           <div className="py-8 px-4 text-center text-gray-500">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
             <p className="text-sm">ไม่พบเอกสารล่าสุด</p>
           </div>
         )}
       </div>
     </div>

     {/* แสดง DocumentPopup เมื่อมีการเลือกเอกสาร */}
     {selectedDoc && typeof document !== 'undefined' && createPortal(
       <DocumentPopup 
         document={{
           ...selectedDoc,
           viewCount,
           downloadCount
         }}
         onClose={closePopup}
         onView={handleViewDocument}
         onDownload={handleDownload}
       />,
       document.body
     )}
   </>
 );
}