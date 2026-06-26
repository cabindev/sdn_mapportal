// app/components/LocationStackList.tsx
// รายการเอกสารที่อยู่ในพิกัดเดียวกัน ใช้เมื่อมีหลายเอกสารซ้อนกันที่จุดเดียว
// ผู้ใช้เลือกเอกสารที่ต้องการ แล้วจึงเปิด popup รายละเอียดของเอกสารนั้น
"use client";

import { DocumentWithCategory } from "@/app/types/document";
import { getCategoryColor } from "@/app/utils/colorGenerator";
import { X, MapPin, Eye, ChevronRight } from "lucide-react";

interface LocationStackListProps {
  documents: DocumentWithCategory[];
  onSelect: (document: DocumentWithCategory) => void;
  onClose: () => void;
}

export default function LocationStackList({
  documents,
  onSelect,
  onClose,
}: LocationStackListProps) {
  const first = documents[0];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-[999]" onClick={onClose} />

      {/* Card */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[90vw] max-h-[80vh] bg-white rounded-2xl shadow-xl z-[1000] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900">เอกสารในตำแหน่งนี้</h3>
              {first && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    {first.district}, {first.amphoe}, {first.province}
                  </span>
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {documents.length} รายการในจุดเดียวกัน
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700 flex-shrink-0"
              title="ปิด"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto divide-y divide-gray-100">
          {documents.map((doc) => {
            const colorScheme = getCategoryColor(doc.categoryId);
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelect(doc)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left transition-colors"
              >
                <img
                  src={doc.coverImage || "/cover.svg"}
                  alt={doc.title}
                  className="w-14 h-14 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = "/cover.svg";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colorScheme.primary }}
                    />
                    <span className="text-xs text-gray-500 truncate">
                      {doc.category?.name || "เอกสาร"}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {doc.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span>
                      {new Date(doc.createdAt).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3" />
                      {(doc.viewCount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
