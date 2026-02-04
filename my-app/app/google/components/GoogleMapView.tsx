// app/google/components/GoogleMapView.tsx
"use client";

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { DocumentWithCategory, LocationData } from '@/app/types/document';
import { getCategoryColor } from '@/app/utils/colorGenerator';
import GoogleLeftNavbar from './GoogleLeftNavbar';
import GoogleRightSidebar from './GoogleRightSidebar';
import GoogleDocumentPopup from './GoogleDocumentPopup';
import GoogleProvinceOverlay from './GoogleProvinceOverlay';
import GoogleProvinceCircleOverlay from './GoogleProvinceCircleOverlay';
import GoogleProvinceHighlight from './GoogleProvinceHighlight';
import TambonSearchGoogle from './TambonSearchGoogle';
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
  currentLocation?: { lat: number; lng: number } | null;
  currentProvince?: string | null;
}

export default function GoogleMapView({ documents, onMapLoad, fullscreen = false, showNavigation = false, currentLocation = null, currentProvince = null }: GoogleMapViewProps) {
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
  const [viewCounts, setViewCounts] = useState<Record<number, number>>({});
  const [searchLocation, setSearchLocation] = useState<LocationData | null>(null);

  // State สำหรับ province/region highlight
  const [highlightedProvince, setHighlightedProvince] = useState<string | null>(null);
  const [highlightedProvinces, setHighlightedProvinces] = useState<string[]>([]);
  const [highlightedProvinceColor, setHighlightedProvinceColor] = useState<string>("#F97316");
  const [highlightedRegionName, setHighlightedRegionName] = useState<string | null>(null);

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

  // ฟังก์ชันเพิ่มจำนวนการดู
  const handleViewDocument = useCallback(async (docId: number) => {
    try {
      const response = await fetch(`/api/documents/view/${docId}`, {
        method: 'POST',
      });

      if (response.ok) {
        setViewCounts(prev => ({
          ...prev,
          [docId]: (prev[docId] || 0) + 1
        }));
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }, []);

  const handleClickDocument = useCallback((document: DocumentWithCategory) => {
    setSelectedDoc(document);
    setExpandedInfo(false);
    // เพิ่ม view count เมื่อคลิก
    handleViewDocument(document.id);
  }, [handleViewDocument]);
  
  const handleSearchClick = useCallback(() => {
    console.log('Search clicked');
  }, []);
  
  const handleFlyTo = useCallback((lat: number, lng: number, zoom: number = 12) => {
    if (mapInstance) {
      mapInstance.panTo({ lat, lng });
      mapInstance.setZoom(zoom);
    }
  }, [mapInstance]);

  const handleSelectLocation = useCallback((location: LocationData) => {
    setSearchLocation(location);
    // Fly to the searched location
    if (mapInstance) {
      mapInstance.panTo({ lat: location.lat, lng: location.lng });
      mapInstance.setZoom(13);
    }
  }, [mapInstance]);

  // Handler สำหรับเลือกจังหวัดเดียว
  const handleSelectProvince = useCallback((provinceName: string, color: string) => {
    setHighlightedProvince(provinceName);
    setHighlightedProvinces([]);
    setHighlightedProvinceColor(color);
    setHighlightedRegionName(null);
  }, []);

  // Handler สำหรับเลือกทั้งภูมิภาค
  const handleSelectRegion = useCallback((regionName: string, provinces: string[], color: string) => {
    setHighlightedProvince(null);
    setHighlightedProvinces(provinces);
    setHighlightedProvinceColor(color);
    setHighlightedRegionName(regionName);
  }, []);

  // Handler สำหรับปิด province highlight
  const handleCloseProvinceHighlight = useCallback(() => {
    setHighlightedProvince(null);
    setHighlightedProvinces([]);
    setHighlightedRegionName(null);
    // Reset map view
    if (mapInstance) {
      mapInstance.panTo(center);
      mapInstance.setZoom(6);
    }
  }, [mapInstance]);

  // Auto fly to current location when it changes
  useEffect(() => {
    if (currentLocation && mapInstance) {
      mapInstance.panTo({ lat: currentLocation.lat, lng: currentLocation.lng });
      mapInstance.setZoom(15);
    }
  }, [currentLocation, mapInstance]);

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
      {/* Search Bar - แสดงใน fullscreen mode */}
      {fullscreen && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-[90%] sm:w-auto">
          <TambonSearchGoogle onSelectLocation={handleSelectLocation} />
        </div>
      )}

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
          {/* Document Markers */}
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
                  handleViewDocument(doc.id);
                }}
                icon={{
                  url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36"><path fill="${encodeURIComponent(colorScheme.primary)}" stroke="white" stroke-width="1" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
                  scaledSize: new google.maps.Size(24, 29),
                  anchor: new google.maps.Point(12, 29)
                }}
                title={doc.title}
              />
            );
          })}

          {/* Search Location Marker */}
          {isLoaded && searchLocation && (
            <Marker
              position={{ lat: searchLocation.lat, lng: searchLocation.lng }}
              icon={{
                url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path fill="%23EF4444" stroke="white" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 40)
              }}
              title="ตำแหน่งที่ค้นหา"
            />
          )}

          {/* Current Location Marker (Blue Dot) */}
          {isLoaded && currentLocation && (
            <>
              {/* Accuracy circle */}
              <Marker
                position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#3B82F6',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                }}
                title="คุณอยู่ที่นี่"
              />
              {/* Outer ring for pulse effect */}
              <Marker
                position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 50,
                  fillColor: '#3B82F6',
                  fillOpacity: 0.1,
                  strokeColor: '#3B82F6',
                  strokeWeight: 1,
                }}
              />
            </>
          )}
          
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
                document={{
                  ...selectedDoc,
                  viewCount: (selectedDoc.viewCount || 0) + (viewCounts[selectedDoc.id] || 0)
                }}
                position={{ lat: selectedDoc.latitude, lng: selectedDoc.longitude }}
                onClose={handleCloseInfoWindow}
                isExpanded={expandedInfo}
                onToggleExpand={toggleExpandInfo}
              />
            </InfoWindow>
          )}

          {/* Province Circle Overlay - แสดงวงกลมจังหวัดเมื่อมีข้อมูล */}
          {isLoaded && currentLocation && currentProvince && (
            <GoogleProvinceCircleOverlay
              currentProvince={currentProvince}
              currentLocation={currentLocation}
              documents={documents}
              map={mapInstance}
            />
          )}

          {/* Province Overlay */}
          <GoogleProvinceOverlay map={mapInstance} />

          {/* Province Highlight - แสดง polygon จังหวัดเมื่อเลือก */}
          {isLoaded && (
            <GoogleProvinceHighlight
              map={mapInstance}
              selectedProvince={highlightedProvince}
              selectedProvinces={highlightedProvinces}
              color={highlightedProvinceColor}
              onClose={handleCloseProvinceHighlight}
            />
          )}
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
                currentProvince={currentProvince}
                onSelectProvince={handleSelectProvince}
                onSelectRegion={handleSelectRegion}
                highlightedProvince={highlightedProvince}
                highlightedRegionName={highlightedRegionName}
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

      {/* Province/Region Info Card - แสดงเมื่อเลือกจังหวัดหรือภูมิภาค */}
      {(highlightedProvince || highlightedProvinces.length > 0) && (
        <div className="absolute top-20 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 min-w-[200px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: highlightedProvinceColor }}
                />
                <h3 className="font-bold text-gray-800">
                  {highlightedRegionName || highlightedProvince}
                </h3>
              </div>
              {/* แสดงจำนวนจังหวัดเมื่อเลือกภูมิภาค */}
              {highlightedProvinces.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {highlightedProvinces.length} จังหวัด
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleCloseProvinceHighlight}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
              title="ปิด"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}