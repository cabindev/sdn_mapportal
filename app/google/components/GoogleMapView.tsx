// app/google/components/GoogleMapView.tsx
"use client";

import { useState, useCallback } from 'react';
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

  // ✅ ใช้ environment variable เท่านั้น - ปลอดภัย
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  // Debug information (ไม่เปิดเผย API Key)
  console.log('🔑 API Key found:', !!apiKey);
  console.log('🔑 API Key length:', apiKey.length);
  console.log('🔑 Environment type:', typeof window !== 'undefined' ? 'Client' : 'Server');
  
  // ตรวจสอบ API Key
  if (!apiKey) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">❌ ไม่พบ API Key</div>
          <p className="text-gray-600">กรุณาตั้งค่า NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</p>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left text-sm">
            <h4 className="font-medium mb-2">วิธีแก้ไขสำหรับ Plesk:</h4>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>ไปที่ Plesk Control Panel</li>
              <li>เลือก Node.js > Custom environment variables</li>
              <li>เพิ่ม: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</li>
              <li>ใส่ค่า API Key</li>
              <li>กด Save และ Restart App</li>
            </ol>
          </div>
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
          
          {/* InfoWindow */}
          {selectedDoc && (
            <InfoWindow
              position={{ lat: selectedDoc.latitude, lng: selectedDoc.longitude }}
              onCloseClick={handleCloseInfoWindow}
              options={{
                maxWidth: expandedInfo ? 500 : 320,
                pixelOffset: new google.maps.Size(0, -40)
              }}
            >
              <div className={`font-sans transition-all duration-300 ${expandedInfo ? 'max-w-[480px]' : 'max-w-xs'}`}>
                <div className="flex flex-col">
                  {/* ส่วนหัว */}
                  <div className="flex justify-between items-start mb-2">
                    <div className={`px-2 py-1 rounded-full text-xs ${expandedInfo ? 'text-sm' : ''}`}
                      style={{
                        backgroundColor: `${getCategoryColor(selectedDoc.categoryId).primary}20`,
                        color: getCategoryColor(selectedDoc.categoryId).primary
                      }}
                    >
                      {selectedDoc.category.name}
                    </div>
                    <button 
                      onClick={toggleExpandInfo}
                      className="text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      {expandedInfo ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* ส่วนแสดงรูปภาพ */}
                  {selectedDoc.coverImage && (
                    <div className={`mb-3 rounded-lg overflow-hidden w-full shadow-sm ${expandedInfo ? 'h-56' : 'h-40'}`}>
                      <img 
                        src={selectedDoc.coverImage}
                        alt={selectedDoc.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* หัวข้อเอกสาร */}
                  <h3 className={`font-medium text-gray-800 mb-2 ${expandedInfo ? 'text-xl' : 'text-lg'}`}>
                    {selectedDoc.title}
                  </h3>
                  
                  {/* คำอธิบาย */}
                  <div className="mb-3">
                    <p className={`text-gray-600 ${expandedInfo ? 'text-base' : 'text-sm'} ${!expandedInfo ? 'line-clamp-3' : ''}`}>
                      {selectedDoc.description}
                    </p>
                    
                    {!expandedInfo && selectedDoc.description.length > 150 && (
                      <button
                        className="text-xs font-medium text-orange-500 hover:text-orange-600 mt-1 transition"
                        onClick={toggleExpandInfo}
                      >
                        อ่านเพิ่มเติม...
                      </button>
                    )}
                  </div>
                  
                  {/* ข้อมูลพื้นที่ */}
                  <div className="bg-gray-50 p-3 rounded-md mb-3 text-xs">
                    <div className="flex flex-wrap items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className={expandedInfo ? 'text-sm' : 'text-xs'}>
                        {selectedDoc.district}, {selectedDoc.amphoe}, {selectedDoc.province}
                      </span>
                    </div>
                    
                    {selectedDoc.year && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                        </svg>
                        <span className={expandedInfo ? 'text-sm' : 'text-xs'}>
                          ปี พ.ศ. {selectedDoc.year}
                        </span>
                      </div>
                    )}
                    
                    {expandedInfo && (
                      <div className="flex items-center mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">
                          อัปเดตล่าสุด: {new Date(selectedDoc.updatedAt).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* ส่วนสถิติการเข้าชม - แสดงเฉพาะเมื่อขยาย */}
                  {expandedInfo && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-blue-50 rounded-md p-2 flex flex-col items-center">
                        <div className="text-sm text-blue-700">การเข้าชม</div>
                        <div className="text-xl font-semibold text-blue-800">{selectedDoc.viewCount}</div>
                      </div>
                      <div className="bg-green-50 rounded-md p-2 flex flex-col items-center">
                        <div className="text-sm text-green-700">ดาวน์โหลด</div>
                        <div className="text-xl font-semibold text-green-800">{selectedDoc.downloadCount}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* ปุ่มดูเอกสาร */}
                  <div className="flex gap-2 mt-2">
                    <a 
                      href={selectedDoc.filePath} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md text-center transition-colors"
                    >
                      เปิดดูเอกสาร
                    </a>
                    <a 
                      href={`${selectedDoc.filePath}?download=true`}
                      download
                      className="flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                  
                  {/* ส่วนล่างแสดงสถิติเมื่อไม่ขยาย */}
                  {!expandedInfo && (
                    <div className="flex text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {selectedDoc.viewCount} ครั้ง
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {selectedDoc.downloadCount} ดาวน์โหลด
                      </div>
                    </div>
                  )}
                  
                  {/* คำแนะนำ - แสดงเฉพาะเมื่อขยาย */}
                  {expandedInfo && (
                    <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 text-center">
                      คลิกที่ลูกศรด้านบนเพื่อย่อข้อมูล
                    </div>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}