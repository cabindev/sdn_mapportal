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

interface GoogleMapViewProps {
  documents: DocumentWithCategory[];
  onMapLoad?: (map: google.maps.Map) => void;
}

export default function GoogleMapView({ documents, onMapLoad }: GoogleMapViewProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentWithCategory | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // ✅ ใช้ environment variable
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  // Debug
  console.log('API Key found:', !!apiKey);
  console.log('API Key length:', apiKey.length);
  
  // ถ้าไม่มี API Key
  if (!apiKey) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">❌ ไม่พบ API Key</div>
          <p className="text-gray-600">
            Environment: {typeof window !== 'undefined' ? 'Client' : 'Server'}
          </p>
          <p className="text-gray-600">
            Process env keys: {Object.keys(process.env).filter(k => k.includes('GOOGLE')).length}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg relative">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">แผนที่เอกสารด้วย Google Maps</h2>
      
      <LoadScript 
        googleMapsApiKey={apiKey}
        onLoad={() => setIsLoaded(true)}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={6}
        >
          {/* แสดงข้อความสำเร็จ */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'white',
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            ✅ Google Maps โหลดสำเร็จ!
          </div>
        </GoogleMap>
      </LoadScript>
    </div>
  );
}