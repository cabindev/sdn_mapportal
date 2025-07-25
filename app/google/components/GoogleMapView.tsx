// app/google/components/GoogleMapView.tsx
"use client";

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { DocumentWithCategory } from '@/app/types/document';
import { getCategoryColor } from '@/app/utils/colorGenerator';
import GoogleLeftNavbar from './GoogleLeftNavbar';
import GoogleRightSidebar from './GoogleRightSidebar';
import GoogleDocumentPopup from './GoogleDocumentPopup';
import GoogleProvinceOverlay from './GoogleProvinceOverlay';
import { getCategories } from '@/app/lib/actions/categories/get';

const getContainerStyle = (fullscreen: boolean) => ({
  width: '100%',
  height: fullscreen ? '100vh' : '600px',
  borderRadius: fullscreen ? '0px' : '8px',
});

const center = {
  lat: 13.0,
  lng: 100.5
};

const mapOptions = {
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
  zoomControl: true,
  styles: [
    {
      featureType: "administrative.province",
      elementType: "geometry.stroke",
      stylers: [{ visibility: "on" }, { weight: 1 }]
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#e0f2f9" }]
    }
  ]
};

interface GoogleMapViewProps {
  documents: DocumentWithCategory[];
  onMapLoad?: (map: google.maps.Map) => void;
  fullscreen?: boolean;
  showNavigation?: boolean;
}

export default function GoogleMapView({ documents, onMapLoad, fullscreen = false, showNavigation = false }: GoogleMapViewProps) {
  // ✅ ประกาศ hooks ทั้งหมดในลำดับที่เหมือนกันเสมอ
  const [selectedDoc, setSelectedDoc] = useState<DocumentWithCategory | null>(null);
  const [expandedInfo, setExpandedInfo] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoadingKey, setIsLoadingKey] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [hoveredDocId, setHoveredDocId] = useState<number | null>(null);

  // ✅ useEffect ต้องอยู่หลัง useState เสมอ
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apiResponse, categoriesData] = await Promise.all([
          fetch('/api/google-maps'),
          getCategories()
        ]);
        
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          setApiKey(data.apiKey);
          console.log('✅ Google Maps API Key loaded successfully');
        } else {
          console.error('❌ Failed to fetch Google Maps API Key');
          setMapError('ไม่สามารถโหลด Google Maps API Key ได้');
        }
        
        setCategories(categoriesData);
        setSelectedCategories(categoriesData.map(c => c.id));
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setMapError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setIsLoadingKey(false);
      }
    };

    fetchData();
  }, []);

  // ✅ useCallback ต้องอยู่หลัง useEffect เสมอ
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setMapInstance(map);
    setIsLoaded(true);
    console.log('✅ Google Maps โหลดสำเร็จ');
    
    if (onMapLoad) {
      onMapLoad(map);
    }
  }, [onMapLoad]);

  const handleMapError = useCallback((error: any) => {
    console.error('❌ Google Maps Error:', error);
    setMapError('ไม่สามารถโหลดแผนที่ได้ กรุณาลองใหม่อีกครั้ง');
  }, []);

  const toggleExpandInfo = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    setExpandedInfo(!expandedInfo);
  }, [expandedInfo]);
  
  const handleCloseInfoWindow = useCallback(() => {
    setSelectedDoc(null);
    setExpandedInfo(false);
  }, []);
  
  const handleHoverDocument = useCallback((documentId: number | null) => {
    setHoveredDocId(documentId);
  }, []);
  
  const handleClickDocument = useCallback((document: DocumentWithCategory) => {
    setSelectedDoc(document);
    setExpandedInfo(false);
  }, []);
  
  const handleSearchClick = useCallback(() => {
    console.log('Search clicked');
  }, []);
  
  const handleFlyTo = useCallback((lat: number, lng: number, zoom: number = 12) => {
    if (mapInstance) {
      mapInstance.panTo({ lat, lng });
      mapInstance.setZoom(zoom);
    }
  }, [mapInstance]);

  // Debug information
  console.log('🔑 API Key found:', !!apiKey);
  console.log('🔑 API Key length:', apiKey.length);
  console.log('🔑 Loading state:', isLoadingKey);
  
  // ✅ Early returns หลังจาก hooks ทั้งหมด
  if (isLoadingKey) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
          <p className="text-gray-600">กำลังโหลด Google Maps API...</p>
        </div>
      </div>
    );
  }
  
  if (!apiKey) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">❌ ไม่พบ API Key</div>
          <p className="text-gray-600">ไม่สามารถโหลด Google Maps API Key ได้</p>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left text-sm">
            <h4 className="font-medium mb-2">วิธีแก้ไขสำหรับ Plesk:</h4>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>ไปที่ Plesk Control Panel</li>
              <li>เลือก Node.js {`>`} Custom environment variables</li>
              <li>เพิ่ม: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</li>
              <li>ใส่ค่า API Key</li>
              <li>กด Save และ Restart App</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">เกิดข้อผิดพลาด</div>
          <p className="text-gray-600">{mapError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            โหลดใหม่
          </button>
        </div>
      </div>
    );
  }

  const containerStyle = getContainerStyle(fullscreen);
  const wrapperClass = fullscreen 
    ? "w-full h-full relative" 
    : "bg-white p-6 rounded-xl shadow-lg relative";

  return (
    <div className={wrapperClass}>
      {!fullscreen && (
        <h2 className="text-xl font-semibold text-gray-800 mb-4">แผนที่เอกสารด้วย Google Maps</h2>
      )}
      
      <LoadScript 
        googleMapsApiKey={apiKey}
        version="weekly"
        onLoad={() => {
          console.log('✅ LoadScript โหลดสำเร็จ');
          setIsLoaded(true);
        }}
        onError={handleMapError}
        loadingElement={
          <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
              <p className="text-gray-600">กำลังโหลดแผนที่...</p>
              <p className="text-sm text-gray-500 mt-1">อาจใช้เวลาสักครู่</p>
            </div>
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={6}
          onLoad={handleMapLoad}
          options={mapOptions}
        >
          {/* Markers */}
          {isLoaded && documents.filter(doc => 
            selectedCategories.length === 0 || selectedCategories.includes(doc.categoryId)
          ).map(doc => {
            const colorScheme = getCategoryColor(doc.categoryId);
            return (
              <Marker 
                key={doc.id}
                position={{ lat: doc.latitude, lng: doc.longitude }}
                onClick={() => {
                  setSelectedDoc(doc);
                  setExpandedInfo(false);
                }}
                icon={{
                  url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36"><path fill="${encodeURIComponent(colorScheme.primary)}" stroke="white" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
                  scaledSize: new google.maps.Size(30, 36),
                  anchor: new google.maps.Point(15, 36)
                }}
                title={doc.title}
              />
            );
          })}
          
          {/* InfoWindow with GoogleDocumentPopup */}
          {selectedDoc && (
            <InfoWindow
              position={{ lat: selectedDoc.latitude, lng: selectedDoc.longitude }}
              onCloseClick={handleCloseInfoWindow}
              options={{
                maxWidth: expandedInfo ? 440 : 380,
                pixelOffset: new google.maps.Size(0, -40)
              }}
            >
              <GoogleDocumentPopup
                document={selectedDoc}
                position={{ lat: selectedDoc.latitude, lng: selectedDoc.longitude }}
                onClose={handleCloseInfoWindow}
                isExpanded={expandedInfo}
                onToggleExpand={toggleExpandInfo}
              />
            </InfoWindow>
          )}
          {/* Province Overlay */}
          <GoogleProvinceOverlay map={mapInstance} />
        </GoogleMap>
      </LoadScript>
      
      {/* Navigation Components - แสดงเฉพาะใน fullscreen */}
      {showNavigation && fullscreen && (
        <>
          {/* GoogleLeftNavbar - ใช้ position absolute แทน leaflet component */}
          <div className="absolute top-0 left-0 z-[1000] h-full pointer-events-none">
            <div className="pointer-events-auto">
              <GoogleLeftNavbar
                documents={documents}
                categories={categories}
                onHoverDocument={handleHoverDocument}
                onClickDocument={handleClickDocument}
                onFlyTo={handleFlyTo}
              />
            </div>
          </div>

          {/* GoogleRightSidebar */}
          <div className="absolute top-0 right-0 z-[1000] h-full pointer-events-none">
            <div className="pointer-events-auto">
              <GoogleRightSidebar
                categories={categories}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                documents={documents}
                onHoverDocument={handleHoverDocument}
                onSearchClick={handleSearchClick}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}