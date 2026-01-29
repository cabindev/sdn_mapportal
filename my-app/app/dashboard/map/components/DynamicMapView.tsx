// app/dashboard/map/components/DynamicMapView.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { CategoryDoc } from "@prisma/client";
import { DocumentWithCategory, LocationData } from "@/app/types/document";
import { getDocuments } from "@/app/lib/actions/documents/get";
import { toast } from "react-hot-toast";
import DocumentForm from "./DocumentForm";
import DocumentPopup from "./DocumentPopup";
import MapMarker from "./MapMarker";
import { THAILAND_BOUNDS } from "@/app/utils/colorGenerator";
import "leaflet/dist/leaflet.css";
import CircleLoader from "./CircleLoader";
import TambonSearch from "./TambonSearch";
import LocationMarker from "./LocationMarker";
import SearchLocationMarker from "./SearchLocationMarker";
import CurrentLocationMarker from "./CurrentLocationMarker";
import ProvinceMarkers from "./ProvinceMarkers";
import LeafletProvinceOverlay from "./LeafletProvinceOverlay";
import ProvinceCircleOverlay from "./ProvinceCircleOverlay";
import LeftNavbar from "./LeftNavbar";
import RightSidebar from "./RightSidebar";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation"; // เพิ่ม import

// Global styles for map components
const MAP_STYLES = `
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
    font-family: 'Inter', sans-serif;
  }
  
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
    background-color: #374151 !important;
    color: white !important;
  }
  
  .leaflet-popup-content-wrapper {
    border-radius: 8px;
    box-shadow: 0 3px 14px rgba(0,0,0,0.15);
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
  }
`;

// Types
interface DynamicMapViewProps {
  categories: CategoryDoc[];
  documents?: DocumentWithCategory[];
  selectedCategories?: number[];
  setSelectedCategories?: (ids: number[]) => void;
  simplified?: boolean;
  fullscreen?: boolean;
  onHoverDocument?: (documentId: number | null) => void;
  children?: React.ReactNode;
  enableLocationMarker?: boolean;
  enableDocumentForm?: boolean;
  enableSearch?: boolean;
  enableNavbar?: boolean;
  enableSidebar?: boolean;
  searchLocation?: LocationData | null;
  currentLocation?: { lat: number; lng: number } | null;
  currentProvince?: string | null;
}

interface MapState {
  isLoading: boolean;
  mapReady: boolean;
  highlightedDocId: number | null;
  selectedLocation: LocationData | null;
  showSearch: boolean;
  selectedDocument: DocumentWithCategory | null;
}

// Custom hooks
function useMapStyles() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const style = document.createElement("style");
    style.innerHTML = MAP_STYLES;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
}

function useDocumentData(
  categories: CategoryDoc[],
  externalDocuments?: DocumentWithCategory[]
) {
  const [internalDocuments, setInternalDocuments] = useState<DocumentWithCategory[]>([]);
  const [internalSelectedCategories, setInternalSelectedCategories] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(!externalDocuments);

  const loadDocuments = useCallback(async () => {
    if (externalDocuments) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const docs = await getDocuments();
      const docsWithDefaults = docs.map(doc => ({
        ...doc,
        year: (doc as any).year ?? (new Date().getFullYear() + 543),
        isLatest: false,
        viewCount: (doc as any).viewCount ?? 0,
        downloadCount: (doc as any).downloadCount ?? 0
      }));
      
      setInternalDocuments(docsWithDefaults);
      setInternalSelectedCategories(categories.map(c => c.id));
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("ไม่สามารถโหลดข้อมูลเอกสารได้");
    } finally {
      setIsLoading(false);
    }
  }, [categories, externalDocuments]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const documents = externalDocuments || internalDocuments;
  const selectedCategories = internalSelectedCategories;

  return {
    documents,
    selectedCategories,
    setSelectedCategories: setInternalSelectedCategories,
    isLoading,
    reloadDocuments: loadDocuments
  };
}

function useProcessedDocuments(
  documents: DocumentWithCategory[],
  selectedCategories: number[],
  highlightedDocId: number | null = null
) {
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc =>
      selectedCategories.length === 0 || selectedCategories.includes(doc.categoryId)
    );
  }, [documents, selectedCategories]);

  const processedDocuments = useMemo(() => {
    const sorted = [...filteredDocuments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return sorted.map((doc, index) => ({
      ...doc,
      isLatest: index === 0 || doc.id === highlightedDocId,
    }));
  }, [filteredDocuments, highlightedDocId]);

  return {
    filteredDocuments,
    processedDocuments
  };
}

// Main component
export default function DynamicMapView({
  categories,
  documents: externalDocuments,
  selectedCategories: externalSelectedCategories,
  setSelectedCategories: externalSetSelectedCategories,
  simplified = false,
  fullscreen = false,
  onHoverDocument: externalOnHoverDocument,
  children,
  enableLocationMarker = true,
  enableDocumentForm = true,
  enableSearch = true,
  enableNavbar = true,
  enableSidebar = true,
  searchLocation = null,
  currentLocation = null,
  currentProvince = null
}: DynamicMapViewProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname(); // เพิ่มการใช้ pathname
  
  // Initialize map styles
  useMapStyles();

  // State management
  const [mapState, setMapState] = useState<MapState>({
    isLoading: true,
    mapReady: false,
    highlightedDocId: null,
    selectedLocation: null,
    showSearch: false,
    selectedDocument: null
  });

  // Document data management
  const {
    documents: internalDocuments,
    selectedCategories: internalSelectedCategories,
    setSelectedCategories: setInternalSelectedCategories,
    isLoading: documentsLoading,
    reloadDocuments
  } = useDocumentData(categories, externalDocuments);

  // Use external or internal data
  const documents = externalDocuments || internalDocuments;
  const selectedCategories = externalSelectedCategories || internalSelectedCategories;
  const setSelectedCategories = externalSetSelectedCategories || setInternalSelectedCategories;

  // Process documents
  const { processedDocuments } = useProcessedDocuments(
    documents,
    selectedCategories,
    mapState.highlightedDocId
  );

  // Initialize map
  useEffect(() => {
    if (typeof window !== "undefined") {
      setMapState(prev => ({ ...prev, mapReady: true }));
    }
  }, []);

  // Update loading state
  useEffect(() => {
    setMapState(prev => ({ ...prev, isLoading: documentsLoading }));
  }, [documentsLoading]);

  // Feature control logic
  const isAuthenticated = status === "authenticated";
  const isDashboardRoute = pathname?.startsWith('/dashboard'); // เช็คว่าอยู่ใน dashboard หรือไม่
  
  // ปรับเงื่อนไขการแสดง LocationMarker
  const shouldShowLocationMarker = !simplified && 
                                   enableLocationMarker && 
                                   isAuthenticated && 
                                   isDashboardRoute; // เพิ่มเงื่อนไข dashboard
                                   
  const shouldShowDocumentForm = !simplified && 
                                enableDocumentForm && 
                                isAuthenticated && 
                                isDashboardRoute; // เพิ่มเงื่อนไข dashboard
                                
  const shouldShowSearch = !simplified && enableSearch;
  const shouldShowNavbar = !simplified && enableNavbar;
  const shouldShowSidebar = !simplified && enableSidebar;

  // Event handlers
  const handleHoverDocument = useCallback((documentId: number | null) => {
    setMapState(prev => ({ ...prev, highlightedDocId: documentId }));
    externalOnHoverDocument?.(documentId);
  }, [externalOnHoverDocument]);

  // ฟังก์ชันสำหรับจัดการ popup จาก navbar
  const handleClickDocument = useCallback((document: DocumentWithCategory) => {
    const docWithStats = {
      ...document,
      viewCount: (document as any).viewCount ?? 0,
      downloadCount: (document as any).downloadCount ?? 0
    };
    
    // แสดง popup และปิดฟอร์มถ้ามี
    setMapState(prev => ({ 
      ...prev, 
      selectedDocument: docWithStats,
      selectedLocation: null // ปิดฟอร์มเพิ่มเอกสาร
    }));
  }, []);

  const handleClosePopup = useCallback(() => {
    setMapState(prev => ({ ...prev, selectedDocument: null }));
  }, []);

  const handleViewDocument = useCallback(() => {
    console.log("View document");
  }, []);

  const handleDownloadDocument = useCallback(() => {
    console.log("Download document");
  }, []);

  const handleSelectLocation = useCallback((location: LocationData) => {
    if (!isAuthenticated) {
      toast.error("กรุณาเข้าสู่ระบบเพื่อเพิ่มข้อมูลพื้นที่");
      return;
    }
    
    if (!isDashboardRoute) {
      toast.error("สามารถเพิ่มข้อมูลได้เฉพาะในหน้าจัดการระบบเท่านั้น");
      return;
    }
    
    if (shouldShowDocumentForm) {
      setMapState(prev => ({ ...prev, selectedLocation: location }));
    }
  }, [shouldShowDocumentForm, isAuthenticated, isDashboardRoute]);

  const handleCloseForm = useCallback(() => {
    setMapState(prev => ({ ...prev, selectedLocation: null }));
  }, []);

  const handleFormSuccess = useCallback(async () => {
    try {
      if (externalSetSelectedCategories && externalDocuments) {
        handleCloseForm();
        toast.success("บันทึกข้อมูลสำเร็จ");
      } else {
        await reloadDocuments();
        handleCloseForm();
        toast.success("บันทึกข้อมูลสำเร็จ");
      }
    } catch (error) {
      console.error("Error reloading documents:", error);
      toast.error("ไม่สามารถโหลดข้อมูลเอกสารได้");
    }
  }, [externalSetSelectedCategories, externalDocuments, handleCloseForm, reloadDocuments]);

  const handleToggleSearch = useCallback(() => {
    setMapState(prev => ({ ...prev, showSearch: !prev.showSearch }));
  }, []);

  // Loading state
  if (mapState.isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <CircleLoader />
      </div>
    );
  }

  // Render map
  return (
    <div className="absolute inset-0">
      {mapState.mapReady && (
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

          <ProvinceMarkers />
          <LeafletProvinceOverlay />

          {processedDocuments.map((doc) => (
            <MapMarker 
              key={doc.id} 
              document={doc} 
              onHover={handleHoverDocument}
            />
          ))}

          {/* แสดง LocationMarker เฉพาะใน dashboard route เท่านั้น */}
          {shouldShowLocationMarker && (
            <LocationMarker onSelectLocation={handleSelectLocation} />
          )}

          {/* แสดง Search Location Marker เมื่อมีการค้นหา */}
          {searchLocation && (
            <SearchLocationMarker location={searchLocation} />
          )}

          {/* แสดง Current Location Marker */}
          {currentLocation && (
            <CurrentLocationMarker location={currentLocation} />
          )}

          {/* แสดง Province Circle Overlay เมื่อมีข้อมูลจังหวัด */}
          {currentLocation && currentProvince && (
            <ProvinceCircleOverlay
              currentProvince={currentProvince}
              currentLocation={currentLocation}
              documents={documents}
            />
          )}

          <ZoomControl position="topright" />
          
          {/* Navigation Components */}
          {shouldShowNavbar && (
            <LeftNavbar
              documents={documents}
              categories={categories}
              onHoverDocument={handleHoverDocument}
              onClickDocument={handleClickDocument}
              currentProvince={currentProvince}
            />
          )}

          {shouldShowSidebar && (
            <RightSidebar
              categories={categories}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              documents={documents}
              onHoverDocument={handleHoverDocument}
              onSearchClick={handleToggleSearch}
            />
          )}
          
          {children}
        </MapContainer>
      )}

      {/* Document Popup */}
      {mapState.selectedDocument && (
        <DocumentPopup
          document={mapState.selectedDocument}
          onClose={handleClosePopup}
          onView={handleViewDocument}
          onDownload={handleDownloadDocument}
        />
      )}

      {/* Search Modal */}
      {shouldShowSearch && mapState.showSearch && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">ค้นหาตำแหน่ง</h3>
                <button
                  type="button"
                  onClick={handleToggleSearch}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4">
              <TambonSearch
                onSelectLocation={(locationData) => {
                  handleSelectLocation(locationData);
                  setMapState(prev => ({ ...prev, showSearch: false }));
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Document Form Modal - แสดงเฉพาะใน dashboard */}
      {shouldShowDocumentForm && mapState.selectedLocation && isDashboardRoute && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <DocumentForm
              categories={categories}
              location={mapState.selectedLocation}
              onClose={handleCloseForm}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}