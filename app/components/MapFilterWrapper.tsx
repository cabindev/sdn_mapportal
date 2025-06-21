// app/components/MapFilterWrapper.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CategoryDoc } from "@prisma/client";
import { DocumentWithCategory } from "@/app/types/document";
import CircleLoader from "@/app/dashboard/map/components/CircleLoader";

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

  return (
    <div className={`relative ${containerClass} bg-gray-50`}>
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
      />
    </div>
  );
}