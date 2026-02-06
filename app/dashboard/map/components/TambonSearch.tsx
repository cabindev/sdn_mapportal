//app/dashboard/map/components/TambonSearch.tsx
"use client";

import { useState, useEffect, useMemo, useCallback, ChangeEvent } from "react";
import tambonData from "@/app/data/tambon.json"; 
import { LocationData } from "@/app/types/document";
import { toast } from "react-hot-toast";

interface TambonSearchProps {
  onSelectLocation: (location: LocationData) => void;
}

export default function TambonSearch({ onSelectLocation }: TambonSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // เตรียมข้อมูลตำบลทั้งหมดจาก tambon.json
  const allTambons = tambonData.data;

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // ฟังก์ชัน filter รายการตาม debouncedSearchTerm
  const filteredTambons = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) return [];

    const lowerTerm = debouncedSearchTerm.toLowerCase();

    const filtered = allTambons.filter((item) => {
      const tambonName = item.TAMBON_T?.toLowerCase() || "";
      const amphoeName = item.AMPHOE_T?.toLowerCase() || "";
      const changwatName = item.CHANGWAT_T?.toLowerCase() || "";
      return (
        tambonName.includes(lowerTerm) ||
        amphoeName.includes(lowerTerm) ||
        changwatName.includes(lowerTerm)
      );
    });

    // จำกัดผลลัพธ์ไม่เกิน 10 รายการเพื่อประสิทธิภาพ
    return filtered.slice(0, 10);
  }, [debouncedSearchTerm, allTambons]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSelectTambon = useCallback(
    async (item: any) => {
      const lat = item.LAT;
      const lng = item.LONG;

      try {
        setIsLoading(true);
        toast.loading("กำลังดึงข้อมูลที่อยู่...", { id: "location-fetch" });

        const response = await fetch(
          `/api/gistda/reverse-geocode?lat=${lat}&lng=${lng}`
        );
        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลที่อยู่ได้");
        }

        const addressData = await response.json();
        toast.dismiss("location-fetch");
        toast.success("ดึงข้อมูลสำเร็จ");

        onSelectLocation({
          lat,
          lng,
          province: addressData.province,
          amphoe: addressData.district,
          district: addressData.subdistrict,
          geocode: addressData.geocode || 0,
        });

        // เคลียร์ค่า search
        setSearchTerm("");
        setDebouncedSearchTerm("");
      } catch (error) {
        console.error(error);
        toast.dismiss("location-fetch");
        toast.error("ไม่สามารถดึงข้อมูลที่อยู่ได้ กรุณาลองใหม่");
      } finally {
        setIsLoading(false);
      }
    },
    [onSelectLocation]
  );

  return (
    <div className="relative w-full max-w-[280px] sm:max-w-sm md:max-w-md mx-auto">
      {/* ช่องค้นหาที่ปรับตามภาพ - ขนาดเล็กลง */}
      <div className="flex items-center bg-black/80 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 text-gray-400 ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="w-full bg-transparent text-white px-2 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none placeholder-gray-400"
          placeholder="ค้นหา ตำบล อำเภอ จังหวัด"
          value={searchTerm}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        {isLoading && (
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9">
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-orange-500 border-t-transparent"></div>
          </div>
        )}
        {searchTerm && !isLoading && (
          <button
            onClick={() => {
              setSearchTerm("");
              setDebouncedSearchTerm("");
            }}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* แสดงรายการที่กรองได้ - responsive และเล็กลง */}
      {debouncedSearchTerm && filteredTambons.length > 0 && (
        <ul className="absolute z-10 w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg mt-1 max-h-48 sm:max-h-60 overflow-auto shadow-xl">
          {filteredTambons.map((item, index) => (
            <li
              key={`${item.TAMBON_T}-${index}`}
              className="px-3 py-2 sm:px-4 sm:py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
              onClick={() => handleSelectTambon(item)}
            >
              <div className="text-xs sm:text-sm">
                <span className="font-semibold text-gray-800">
                  {item.TAMBON_T || "ไม่ทราบชื่อตำบล"}
                </span>
                {item.AMPHOE_T && (
                  <span className="text-gray-600"> • {item.AMPHOE_T}</span>
                )}
                {item.CHANGWAT_T && (
                  <span className="text-gray-500"> • {item.CHANGWAT_T}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* กรณีค้นหาแล้วไม่เจอตำบล */}
      {debouncedSearchTerm && filteredTambons.length === 0 && !isLoading && (
        <div className="absolute z-10 w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg mt-1 p-3 text-gray-500 text-xs sm:text-sm text-center shadow-lg">
          ไม่พบข้อมูล
        </div>
      )}
    </div>
  );
}