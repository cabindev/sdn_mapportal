// app/google/components/GoogleMapView.tsx
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { DocumentWithCategory } from '@/app/types/document';
import { getCategoryColor } from '@/app/utils/colorGenerator';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px',
};

const center = {
  lat: 15.870032,
  lng: 100.992541
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
}

export default function GoogleMapView({ documents, onMapLoad }: GoogleMapViewProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentWithCategory | null>(null);
  const [expandedInfo, setExpandedInfo] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  

  
  // ✅ ใช้ environment variable เท่านั้น
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  // ตรวจสอบ API Key
  if (!apiKey) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">❌ ไม่พบ API Key</div>
          <p className="text-gray-600">กรุณาตั้งค่า NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</p>
        </div>
      </div>
    );
  }
  
  // เก็บ reference ของแผนที่เมื่อโหลดเสร็จ
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setIsLoaded(true);
    console.log('✅ Google Maps โหลดสำเร็จ');
    
    if (onMapLoad) {
      onMapLoad(map);
    }
  }, [onMapLoad]);

  // Handle map error
  const handleMapError = (error: any) => {
    console.error('❌ Google Maps Error:', error);
    setMapError('ไม่สามารถโหลดแผนที่ได้ กรุณาลองใหม่อีกครั้ง');
  };

  // ขยายหน้าต่าง InfoWindow
  const toggleExpandInfo = (e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedInfo(!expandedInfo);
  };
  
  // ปิด InfoWindow และรีเซ็ตสถานะ
  const handleCloseInfoWindow = () => {
    setSelectedDoc(null);
    setExpandedInfo(false);
  };

  // แสดง error state
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

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg relative">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">แผนที่เอกสารด้วย Google Maps</h2>
      
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
          {isLoaded && documents.map(doc => {
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
          
          {/* InfoWindow - เหมือนเดิม */}
          {selectedDoc && (
            <InfoWindow
              position={{ lat: selectedDoc.latitude, lng: selectedDoc.longitude }}
              onCloseClick={handleCloseInfoWindow}
              options={{
                maxWidth: expandedInfo ? 500 : 320,
                pixelOffset: new google.maps.Size(0, -40)
              }}
            >
              {/* InfoWindow content เหมือนเดิม */}
              <div className={`font-sans transition-all duration-300 ${expandedInfo ? 'max-w-[480px]' : 'max-w-xs'}`}>
                {/* ใส่ content InfoWindow เหมือนเดิม */}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}