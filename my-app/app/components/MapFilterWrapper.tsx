// app/components/MapFilterWrapper.tsx
"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { CategoryDoc } from "@prisma/client";
import { DocumentWithCategory, LocationData } from "@/app/types/document";
import CircleLoader from "@/app/dashboard/map/components/CircleLoader";
import TambonSearch from "@/app/dashboard/map/components/TambonSearch";
import { toast } from "react-hot-toast";

// Lazy load map component
const DynamicMapView = dynamic(
  () => import("@/app/dashboard/map/components/DynamicMapView"),
  {
    ssr: false,
    loading: () => <CircleLoader />,
  }
);

interface MapFilterWrapperProps {
  categories: CategoryDoc[];
  documents: DocumentWithCategory[];
  fullHeight?: boolean;
  showTitle?: boolean;
  fullscreen?: boolean;
  simplified?: boolean;
}

export default function MapFilterWrapper({
  categories,
  documents,
  fullHeight = false,
  showTitle = true,
  fullscreen = false,
  simplified = false
}: MapFilterWrapperProps) {
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    categories.map((c) => c.id)
  );
  const [hoveredDocId, setHoveredDocId] = useState<number | null>(null);
  const [searchLocation, setSearchLocation] = useState<LocationData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentProvince, setCurrentProvince] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Filter documents based on selected categories
  const filteredDocuments = documents.filter(
    (doc) =>
      selectedCategories.length === 0 ||
      selectedCategories.includes(doc.categoryId)
  );

  const containerClass = fullscreen
    ? "w-full h-screen"
    : fullHeight
    ? "w-full h-full"
    : "w-full h-96";

  // Handle location selection from search
  const handleSelectLocation = useCallback((location: LocationData) => {
    setSearchLocation(location);
  }, []);

  // Get current location
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
    <div className={`relative ${containerClass} bg-gray-50`}>
      {/* Search Bar - แสดงในหน้าแรกเท่านั้น */}
      {fullscreen && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-[90%] sm:w-auto">
          <TambonSearch onSelectLocation={handleSelectLocation} />
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

      {showTitle && !fullscreen && (
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800">
            แผนที่เอกสาร
          </h2>
          <p className="text-sm text-gray-600">
            {filteredDocuments.length} เอกสารจากทั้งหมด {documents.length} เอกสาร
          </p>
        </div>
      )}

      <DynamicMapView
        categories={categories}
        documents={filteredDocuments}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        simplified={simplified}
        fullscreen={fullscreen}
        onHoverDocument={setHoveredDocId}
        searchLocation={searchLocation}
        currentLocation={currentLocation}
        currentProvince={currentProvince}
      />
    </div>
  );
}