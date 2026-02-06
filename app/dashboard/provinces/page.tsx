// app/dashboard/provinces/page.tsx
import { getProvincesWithStatsByRegion } from '@/app/lib/actions/statistics/provinces'
import { Suspense } from 'react'
import ProvincesPageClient from './components/ProvincesPageClient'

export default async function ProvincesPage({
  searchParams
}: {
  searchParams: Promise<{
    region?: string;
    search?: string;
  }>
}) {
  // ต้อง await searchParams ตาม Next.js 15
  const params = await searchParams;
  
  // ดึงค่าจาก URL parameters
  const region = params?.region || 'all';
  const search = params?.search || '';
  
  // ดึงข้อมูลจังหวัดตามภูมิภาคที่เลือก
  const provinces = await getProvincesWithStatsByRegion(region);
  
  return (
    <Suspense fallback={<div className="p-6">กำลังโหลดข้อมูล...</div>}>
      <ProvincesPageClient 
        provinces={provinces}
        initialRegion={region}
        initialSearch={search}
      />
    </Suspense>
  )
}

// กำหนดให้โหลดข้อมูลใหม่เสมอเมื่อ URL เปลี่ยน
export const dynamic = "force-dynamic"