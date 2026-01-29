// app/dashboard/map/components/SearchLocationMarker.tsx
"use client";

import { useEffect } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { LocationData } from "@/app/types/document";

interface SearchLocationMarkerProps {
  location: LocationData;
}

// Custom icon for search location
const searchIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23EF4444' stroke='white' stroke-width='2'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  className: "search-location-marker",
});

export default function SearchLocationMarker({ location }: SearchLocationMarkerProps) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      // Fly to the searched location
      map.flyTo([location.lat, location.lng], 13, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [location, map]);

  return (
    <Marker position={[location.lat, location.lng]} icon={searchIcon}>
      <Popup className="search-location-popup">
        <div className="p-2 min-w-[200px]">
          <h3 className="font-semibold text-gray-800 text-sm mb-2">
            📍 ตำแหน่งที่ค้นหา
          </h3>
          <div className="space-y-1 text-xs text-gray-600">
            {location.district && (
              <p>
                <span className="font-medium">ตำบล:</span> {location.district}
              </p>
            )}
            {location.amphoe && (
              <p>
                <span className="font-medium">อำเภอ:</span> {location.amphoe}
              </p>
            )}
            {location.province && (
              <p>
                <span className="font-medium">จังหวัด:</span> {location.province}
              </p>
            )}
            <p className="text-gray-400 mt-2">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
