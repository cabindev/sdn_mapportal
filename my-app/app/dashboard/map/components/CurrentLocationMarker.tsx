// app/dashboard/map/components/CurrentLocationMarker.tsx
"use client";

import { useEffect } from "react";
import { Marker, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";

interface CurrentLocationMarkerProps {
  location: { lat: number; lng: number };
}

// Custom icon for current location (blue dot)
const currentLocationIcon = new L.DivIcon({
  className: "current-location-marker",
  html: `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 16px;
        height: 16px;
        background: #3B82F6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 24px;
        height: 24px;
        background: rgba(59, 130, 246, 0.2);
        border-radius: 50%;
        animation: pulse-ring 2s ease-out infinite;
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function CurrentLocationMarker({ location }: CurrentLocationMarkerProps) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      // Fly to current location
      map.flyTo([location.lat, location.lng], 15, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [location, map]);

  return (
    <>
      {/* Accuracy circle */}
      <Circle
        center={[location.lat, location.lng]}
        radius={50}
        pathOptions={{
          color: "#3B82F6",
          fillColor: "#3B82F6",
          fillOpacity: 0.1,
          weight: 1,
        }}
      />

      {/* Current location marker */}
      <Marker position={[location.lat, location.lng]} icon={currentLocationIcon}>
        <Popup className="current-location-popup">
          <div className="p-2 min-w-[150px]">
            <h3 className="font-semibold text-blue-600 text-sm mb-2">
              📍 คุณอยู่ที่นี่
            </h3>
            <div className="space-y-1 text-xs text-gray-600">
              <p>
                <span className="font-medium">Lat:</span> {location.lat.toFixed(6)}
              </p>
              <p>
                <span className="font-medium">Lng:</span> {location.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </Popup>
      </Marker>

      <style jsx global>{`
        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        .current-location-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </>
  );
}
