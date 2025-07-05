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
    if (!debouncedSearchTerm) return [];

    const lowerTerm = debouncedSearchTerm.toLowerCase();

    return allTambons.filter((item) => {
      const tambonName = item.TAMBON_T?.toLowerCase() || "";
      const amphoeName = item.AMPHOE_T?.toLowerCase() || "";
      const changwatName = item.CHANGWAT_T?.toLowerCase() || "";
      return (
        tambonName.includes(lowerTerm) ||
        amphoeName.includes(lowerTerm) ||
        changwatName.includes(lowerTerm)
      );
    });
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
    <div className="relative w-full sm:w-96 lg:w-[400px]">
      {/* ช่องค้นหาที่ปรับตามภาพ */}
      <div className="flex items-center bg-black/80 rounded-md overflow-hidden border border-gray-700">
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="w-full bg-transparent text-white px-2 py-2 text-sm focus:outline-none"
          placeholder="ค้นหาตำบล อำเภอ หรือจังหวัด"
          value={searchTerm}
          onChange={handleInputChange}
        />
      </div>
      
      {/* แสดงรายการที่กรองได้ */}
      {debouncedSearchTerm && filteredTambons.length > 0 && (
        <ul className="absolute z-10 w-full bg-white/90 backdrop-blur-sm border rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
          {filteredTambons.map((item, index) => (
            <li
              key={`${item.TAMBON_T}-${index}`}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectTambon(item)}
            >
              <span className="font-medium text-gray-700">
                {item.TAMBON_T || "ไม่ทราบชื่อตำบล"}
              </span>
              {item.AMPHOE_T && (
                <span className="text-gray-600">, {item.AMPHOE_T}</span>
              )}
              {item.CHANGWAT_T && (
                <span className="text-gray-500">, {item.CHANGWAT_T}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* กรณีค้นหาแล้วไม่เจอตำบล */}
      {debouncedSearchTerm && filteredTambons.length === 0 && !isLoading && (
        <div className="absolute z-10 w-full bg-white/90 backdrop-blur-sm border rounded-md mt-1 p-3 text-gray-500">
          ไม่พบข้อมูล
        </div>
      )}
    </div>
  );
}