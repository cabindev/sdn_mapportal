// app/dashboard/map/components/DynamicMapView.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, ZoomControl, Rectangle } from "react-leaflet";
import { CategoryDoc } from "@prisma/client";
import { DocumentWithCategory, LocationData } from "@/app/types/document";
import { getDocuments } from "@/app/lib/actions/documents/get";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import DocumentForm from "./DocumentForm";
import MapMarker from "./MapMarker";
import { THAILAND_BOUNDS } from "@/app/utils/colorGenerator";
import "leaflet/dist/leaflet.css";
import CircleLoader from "./CircleLoader";
import TambonSearch from "./TambonSearch";
import LocationMarker from "./LocationMarker";
import ProvinceMarkers from "./ProvinceMarkers";

// นำเข้า RecentDocumentsSidebar แบบ dynamic และเฉพาะเมื่อจำเป็น
const RecentDocumentsSidebar = dynamic(
  () => import("./RecentDocumentsSidebar"),
  { 
    ssr: false, 
    loading: () => <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-lg p-4 shadow-md w-64 h-80"></div> 
  }
);

// CSS สำหรับ custom marker และ animation
const addCustomStyles = () => {
  if (typeof window === "undefined") return;

  const style = document.createElement("style");
  style.innerHTML = `
   .custom-marker {
     background: none !important;
     border: none !important;
   }
   
   @keyframes ping {
     0% {
       transform: scale(0.8);
       opacity: 0.8;
     }
     70%, 100% {
       transform: scale(1.7);
       opacity: 0;
     }
   }
   
   @keyframes pulse {
     0%, 100% {
       opacity: 1;
     }
     50% {
       opacity: 0.5;
     }
   }
   
   .animate-pulse {
     animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
   }
   
   .leaflet-container {
     width: 100%;
     height: 100%;
     font-family: 'Prompt', sans-serif;
   }
   
   /* ปรับตำแหน่ง controls ของ leaflet */
   .leaflet-top {
     z-index: 800;
   }
   
   .leaflet-bottom {
     z-index: 800;
   }
   
   .leaflet-control-zoom {
     margin-top: 10px !important;
     margin-right: 10px !important;
     border-radius: 8px !important;
     box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
     overflow: hidden;
   }
   
   .leaflet-control-zoom a {
     background-color: rgba(255, 255, 255, 0.9) !important;
     color: #333 !important;
     border-color: #eee !important;
     transition: all 0.2s ease;
   }
   
   .leaflet-control-zoom a:hover {
     background-color: #f97316 !important;
     color: white !important;
   }
   
   .leaflet-popup-content-wrapper {
     border-radius: 8px;
     box-shadow: 0 3px 14px rgba(0,0,0,0.15);
     background-color: rgba(255, 255, 255, 0.95);
     backdrop-filter: blur(10px);
   }
 `;
  document.head.appendChild(style);
  return () => {
    document.head.removeChild(style);
  };
};



// Component หลัก
interface DynamicMapViewProps {
  categories: CategoryDoc[];
  documents?: DocumentWithCategory[];
  selectedCategories?: number[];
  setSelectedCategories?: (ids: number[]) => void;
  simplified?: boolean;
  fullscreen?: boolean;
  showRecentDocuments?: boolean;
  recentDocuments?: DocumentWithCategory[]; 
  onHoverDocument?: (documentId: number | null) => void;
}

export default function DynamicMapView({
  categories,
  documents: externalDocuments,
  selectedCategories: externalSelectedCategories,
  setSelectedCategories: externalSetSelectedCategories,
  simplified = false,
  fullscreen = false,
  showRecentDocuments = true, // เปลี่ยนค่าเริ่มต้นเป็น true
  recentDocuments: externalRecentDocuments,
  onHoverDocument: externalOnHoverDocument,
}: DynamicMapViewProps) {
  // ปรับ type ให้เข้ากับ type ที่มีใน LocationMarker
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number; 
    lng: number; 
    province?: string; 
    amphoe?: string; 
    district?: string;
    geocode?: number;
  } | null>(null);
  
  const [internalDocuments, setInternalDocuments] = useState<DocumentWithCategory[]>([]);
  const [internalSelectedCategories, setInternalSelectedCategories] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(!externalDocuments);
  const [mapReady, setMapReady] = useState(false);
  const [highlightedDocId, setHighlightedDocId] = useState<number | null>(null);
  
  // ใช้ documents จากภายนอกถ้ามี หรือใช้ภายในถ้าไม่มี
  const documents = externalDocuments || internalDocuments;

  // ใช้ selectedCategories จากภายนอกถ้ามี หรือใช้ภายในถ้าไม่มี
  const selectedCategories =
    externalSelectedCategories || internalSelectedCategories;

  // ใช้ setSelectedCategories จากภายนอกถ้ามี หรือใช้ภายในถ้าไม่มี
  const setSelectedCategories =
    externalSetSelectedCategories || setInternalSelectedCategories;

  // ฟังก์ชันจัดการเมื่อ hover ที่เอกสาร
  const handleHoverDocument = (documentId: number | null) => {
    setHighlightedDocId(documentId);
    if (externalOnHoverDocument) {
      externalOnHoverDocument(documentId);
    }
  };

  // ใช้ custom hook เพื่อจัดการข้อมูล
  const { filteredDocuments, sortedDocuments, processedDocuments } =
    useProcessedDocuments(documents, selectedCategories, highlightedDocId);

    
  // เพิ่ม CSS styles
  useEffect(() => {
    const cleanup = addCustomStyles();
    return cleanup;
  }, []);

  // เมื่อ component ถูกโหลด ให้ตั้งค่า mapReady เป็น true
  useEffect(() => {
    if (typeof window !== "undefined") {
      setMapReady(true);
    }
  }, []);

  // โหลดข้อมูลเอกสารเมื่อไม่มี external documents
  useEffect(() => {
    if (externalDocuments) {
      setIsLoading(false);
      return;
    }

    const loadDocuments = async () => {
      try {
        const docs = await getDocuments();
        
        // กำหนดค่า default โดยใช้ Type Assertion เพื่อเข้าถึง year
        const docsWithDefaults = docs.map(doc => ({
          ...doc,
          // @ts-ignore เพื่อข้ามการตรวจสอบ Type หรือใช้วิธีด้านล่าง
          year: (doc as any).year ?? (new Date().getFullYear() + 543),
          isLatest: false
        }));
        
        setInternalDocuments(docsWithDefaults);
        // เริ่มต้นแสดงทุกหมวดหมู่
        setInternalSelectedCategories(categories.map((c) => c.id));
      } catch (error) {
        console.error("Error loading documents:", error);
        toast.error("ไม่สามารถโหลดข้อมูลเอกสารได้");
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [categories, externalDocuments]);

  // คำนวณเอกสารล่าสุดเฉพาะเมื่อต้องแสดง
  const recentDocs = useMemo(() => {
    if (!showRecentDocuments) return [];
    
    return externalRecentDocuments || 
      [...documents].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 10);
  }, [showRecentDocuments, externalRecentDocuments, documents]);

  if (isLoading) {
    return <CircleLoader />;
  }

  return (
    <div className="w-full h-full relative">
      {mapReady && (
        <MapContainer
          center={THAILAND_BOUNDS.center}
          zoom={THAILAND_BOUNDS.zoom}
          style={{ width: "100%", height: "100%" }}
          minZoom={THAILAND_BOUNDS.minZoom}
          maxZoom={THAILAND_BOUNDS.maxZoom}
          maxBounds={THAILAND_BOUNDS.bounds}
          zoomControl={false}
          attributionControl={false}
          className="bg-slate-50"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />



          {/* แสดงจุดจังหวัดเมื่อซูมเข้า */}
          <ProvinceMarkers />

          {/* แสดงข้อมูลเอกสารบนแผนที่ */}
          {processedDocuments.map((doc) => (
            <MapMarker key={doc.id} document={doc} />
          ))}

          {/* แสดง LocationMarker เฉพาะเมื่อไม่ใช่โหมด simplified */}
          {!simplified && (
            <LocationMarker onSelectLocation={(location) => {
              setSelectedLocation(location);
            }} />
          )}

          {/* แสดง ZoomControl ในตำแหน่งที่ด้านบนขวา */}
          <ZoomControl position="topright" />
          
          {/* แสดงรายการเอกสารล่าสุดเฉพาะเมื่อต้องการ และมีเอกสาร */}
          {showRecentDocuments && documents.length > 0 && (
            <RecentDocumentsSidebar
              documents={recentDocs}
              onHoverDocument={handleHoverDocument}
            />
          )}
        </MapContainer>
      )}

      {/* แสดง DocumentForm เฉพาะเมื่อมีการเลือกตำแหน่งและไม่ใช่โหมด simplified */}
      {!simplified && selectedLocation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <DocumentForm
            categories={categories}
            location={selectedLocation as LocationData}
            onClose={() => setSelectedLocation(null)}
            onSuccess={async () => {
              try {
                const newDocs = await getDocuments();
                
                if (externalSetSelectedCategories && externalDocuments) {
                  // ถ้ามีการจัดการจากภายนอก ให้แจ้งเตือนสำเร็จและปิด
                  setSelectedLocation(null);
                  toast.success("บันทึกข้อมูลสำเร็จ");
                } else {
                  // ถ้าจัดการภายใน ให้อัปเดตข้อมูล
                  const docsWithDefaults = newDocs.map(doc => ({
                    ...doc,
                    // @ts-ignore หรือใช้วิธีด้านล่าง
                    year: (doc as any).year ?? (new Date().getFullYear() + 543),
                    isLatest: false
                  }));
                  
                  setInternalDocuments(docsWithDefaults);
                  setSelectedLocation(null);
                  toast.success("บันทึกข้อมูลสำเร็จ");
                }
              } catch (error) {
                console.error("Error reloading documents:", error);
                toast.error("ไม่สามารถโหลดข้อมูลเอกสารได้");
              }
            }}
          />
        </div>
      )}

      {!simplified && (
        <div className="absolute top-4 left-4 z-[900] w-full max-w-md px-4">
          <TambonSearch
            onSelectLocation={(locationData) => {
              setSelectedLocation(locationData);
            }}
          />
        </div>
      )}
    </div>
  );
}

// Custom hook สำหรับจัดการข้อมูลเอกสาร
function useProcessedDocuments(
  documents: DocumentWithCategory[],
  selectedCategories: number[],
  highlightedDocId: number | null = null
) {
  // กรองเอกสารตามหมวดหมู่ที่เลือก
  const filteredDocuments = useMemo(() => {
    return documents.filter(
      (doc) =>
        selectedCategories.length === 0 ||
        selectedCategories.includes(doc.categoryId)
    );
  }, [documents, selectedCategories]);

  // เรียงลำดับเอกสารให้ล่าสุดอยู่บนสุด
  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredDocuments]);

  // เพิ่ม flag ไปยังเอกสารล่าสุดและเอกสารที่ถูก hover
  const processedDocuments = useMemo(() => {
    return sortedDocuments.map((doc, index) => ({
      ...doc,
      isLatest: index === 0 || doc.id === highlightedDocId,
    }));
  }, [sortedDocuments, highlightedDocId]);

  return {
    filteredDocuments,
    sortedDocuments,
    processedDocuments,
  };
}