// app/google/components/GoogleMapClient.tsx
"use client";

import { useState, useCallback } from 'react';
import { DocumentWithCategory } from '@/app/types/document';
import dynamic from 'next/dynamic';
import { FiMapPin } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import TambonSearchGoogle from './TambonSearchGoogle';
import { LocationData } from '@/app/types/document';

// โหลด GoogleMapView แบบ dynamic
const GoogleMapView = dynamic(() => import('@/app/google/components/GoogleMapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <FiMapPin className="w-8 h-8 mx-auto mb-2 text-orange-500 animate-bounce" />
        <p className="text-gray-600">กำลังโหลดแผนที่...</p>
      </div>
    </div>
  )
});

// โหลด GoogleDocumentSidebar
const GoogleDocumentSidebar = dynamic(() => import('./GoogleDocumentSidebar'), {
  ssr: false
});

interface GoogleMapClientProps {
  documents: DocumentWithCategory[];
  fullscreen?: boolean;
}

export default function GoogleMapClient({ documents, fullscreen = false }: GoogleMapClientProps) {
  const [searchLocation, setSearchLocation] = useState<LocationData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentProvince, setCurrentProvince] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // เรียงลำดับเอกสารล่าสุด
  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const containerClass = fullscreen
    ? "fixed inset-0 w-full h-full"
    : "rounded-xl overflow-hidden shadow-lg relative";

  const handleSelectLocation = useCallback((location: LocationData) => {
    setSearchLocation(location);
  }, []);

  const handleGetCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error("เบราว์เซอร์ของคุณไม่รองรับ Geolocation");
      return;
    }

    setIsGettingLocation(true);
    toast.loading("กำลังค้นหาตำแหน่งของคุณ...", { id: "get-location" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });

        // Reverse geocoding เพื่อหาชื่อจังหวัด
        try {
          const response = await fetch(
            `/api/reverse-geocode?lat=${latitude}&lng=${longitude}`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.province) {
              setCurrentProvince(data.province);
            }
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
        }

        toast.dismiss("get-location");
        toast.success("พบตำแหน่งของคุณแล้ว");
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.dismiss("get-location");
        let errorMessage = "ไม่สามารถระบุตำแหน่งได้";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "คุณไม่อนุญาตให้เข้าถึงตำแหน่ง กรุณาเปิดการเข้าถึงตำแหน่งในเบราว์เซอร์";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "ไม่สามารถระบุตำแหน่งได้ กรุณาลองใหม่อีกครั้ง";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "หมดเวลาในการระบุตำแหน่ง กรุณาลองใหม่";
        }
        toast.error(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  return (
    <div className={containerClass}>
      {/* Search Bar - แสดงใน fullscreen mode */}
      {fullscreen && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-[90%] sm:w-auto">
          <TambonSearchGoogle onSelectLocation={handleSelectLocation} />
        </div>
      )}

      {/* Current Location Button - อยู่กึ่งกลางแนวตั้ง */}
      {fullscreen && (
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="absolute top-1/2 -translate-y-1/2 right-4 z-[900] bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 rounded-lg shadow-sm p-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="แสดงตำแหน่งปัจจุบัน"
        >
          {isGettingLocation ? (
            <div className="animate-spin rounded-full w-4 h-4 border-2 border-orange-500 border-t-transparent"></div>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </button>
      )}

      <GoogleMapView
        documents={documents}
        fullscreen={fullscreen}
        showNavigation={fullscreen}
        currentLocation={currentLocation}
        currentProvince={currentProvince}
      />
      
      {/* แสดง GoogleDocumentSidebar เฉพาะเมื่อไม่ใช่ fullscreen */}
      {!fullscreen && (
        <div className="absolute top-0 right-0 bottom-0 pointer-events-none z-10">
          <div className="relative h-full pointer-events-auto">
            <GoogleDocumentSidebar documents={recentDocuments} />
          </div>
        </div>
      )}
    </div>
  );
}