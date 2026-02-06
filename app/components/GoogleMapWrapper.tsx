"use client";

import { useState, useEffect } from 'react';
import { DocumentWithCategory } from '@/app/types/document';
import dynamic from 'next/dynamic';
import { FiMapPin } from 'react-icons/fi';

// โหลด GoogleMapView แบบ Dynamic
const GoogleMapView = dynamic(() => import('@/app/google/components/GoogleMapView'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 animate-pulse h-[600px] rounded-lg flex items-center justify-center">
      <div className="text-gray-500 flex items-center">
        <FiMapPin className="animate-bounce mr-2" />
        กำลังโหลดแผนที่...
      </div>
    </div>
  )
});

interface GoogleMapWrapperProps {
  documents: DocumentWithCategory[];
}

export default function GoogleMapWrapper({ documents }: GoogleMapWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">แผนที่เอกสารด้วย Google Maps</h2>
        <div className="bg-gray-100 animate-pulse h-[600px] rounded-lg"></div>
      </div>
    );
  }

  return <GoogleMapView documents={documents} />;
}