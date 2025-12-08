// app/dashboard/map/components/LocationMarker.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useMap, CircleMarker, Popup } from 'react-leaflet'
import { LocationData } from '@/app/types/document'
import { toast } from 'react-hot-toast'

interface LocationMarkerProps {
  onSelectLocation: (location: LocationData) => void;
}

export default function LocationMarker({ onSelectLocation }: LocationMarkerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [address, setAddress] = useState<{province: string; district: string; subdistrict: string} | null>(null)
  const map = useMap()

  // ใช้ ref เพื่อเก็บ callback ล่าสุดโดยไม่ต้อง re-register event listener
  const onSelectLocationRef = useRef(onSelectLocation)

  // อัพเดท ref เมื่อ callback เปลี่ยน (ไม่ trigger re-registration)
  useEffect(() => {
    onSelectLocationRef.current = onSelectLocation
  }, [onSelectLocation])

  // Memoize handleMapClick เพื่อไม่ให้สร้างใหม่ทุกครั้ง
  const handleMapClick = useCallback(async (e: any) => {
    const { lat, lng } = e.latlng

    // ตรวจสอบพื้นที่ประเทศไทย
    if (lat < 5.613038 || lat > 20.465143 || lng < 97.343396 || lng > 105.639389) {
      toast.error('กรุณาเลือกตำแหน่งในประเทศไทย')
      return
    }

    setPosition([lat, lng])
    setAddress(null) // รีเซ็ตข้อมูลที่อยู่เมื่อเลือกตำแหน่งใหม่

    try {
      toast.loading('กำลังดึงข้อมูลที่อยู่...', { id: 'location-fetch' })

      // เปลี่ยนมาใช้ API route แทนการเรียก GISTDA API โดยตรง
      const response = await fetch(`/api/gistda/reverse-geocode?lat=${lat}&lng=${lng}`)

      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลที่อยู่ได้')
      }

      const addressData = await response.json()

      toast.dismiss('location-fetch')
      toast.success('ดึงข้อมูลสำเร็จ')

      setAddress({
        province: addressData.province,
        district: addressData.district,
        subdistrict: addressData.subdistrict
      })

      // ใช้ ref เพื่อเรียก callback ล่าสุด
      onSelectLocationRef.current({
        lat,
        lng,
        province: addressData.province,
        amphoe: addressData.district,
        district: addressData.subdistrict,
        geocode: addressData.geocode || 0
      })
    } catch (error) {
      console.error('Location error:', error)
      toast.dismiss('location-fetch')
      toast.error('ไม่สามารถดึงข้อมูลที่อยู่ได้ กรุณาลองใหม่')
    }
  }, []) // ไม่มี dependency เพราะใช้ ref แทน

  useEffect(() => {
    // เพิ่ม event listener เพียงครั้งเดียว
    map.on('click', handleMapClick)

    // ทำความสะอาดเมื่อ unmount
    return () => {
      map.off('click', handleMapClick)
    }
  }, [map, handleMapClick])

  return position ? (
    <CircleMarker 
      center={position}
      pathOptions={{ 
        fillColor: '#f97316',
        fillOpacity: 0.7,
        color: 'white',
        weight: 2
      }}
      radius={8}
    >
      <Popup>
        <div className="text-center">
          {address ? (
            <>
              <p className="font-medium">{address.subdistrict}, {address.district}, {address.province}</p>
            </>
          ) : (
            <p>กำลังโหลดข้อมูล...</p>
          )}
          <p className="text-sm text-gray-500">
            พิกัด: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
        </div>
      </Popup>
    </CircleMarker>
  ) : null
}