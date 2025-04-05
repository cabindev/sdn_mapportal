// app/lib/actions/statistics/get.ts
'use server'

import prisma from '../../db'
import { ChartStatisticData } from '@/app/dashboard/components/types/chart'
import { getCategoryColor } from '@/app/utils/colorGenerator'
import { 
 HealthZone, 
 provinceHealthZones,
 getProvinceHealthZone, 
 getThaiZoneName 
} from '@/app/utils/healthZones'

export async function getDashboardStatistics(): Promise<ChartStatisticData> {
 try {
   // ดึงข้อมูลเอกสารทั้งหมด
   const allDocuments = await prisma.document.findMany({
     include: {
       category: true,
     },
   })

   // จำนวนเอกสารทั้งหมด
   const totalDocuments = allDocuments.length
   
   // จำนวนเอกสารที่เผยแพร่
   const publishedDocuments = allDocuments.filter(doc => doc.isPublished).length
   
   // จำนวนเอกสารที่ไม่เผยแพร่
   const unpublishedDocuments = totalDocuments - publishedDocuments
   
   // จำนวนหมวดหมู่ทั้งหมด
   const categories = await prisma.categoryDoc.findMany()
   const totalCategories = categories.length
   
    // จังหวัดที่มีเอกสาร
    const provinceSet = new Set(allDocuments.map(doc => doc.province))
    const provinces = Array.from(provinceSet)
    const provincesWithDocuments = provinces.length
   
   // จำนวนเอกสารแยกตามจังหวัด
   const documentsByProvince = provinces.map(province => {
     const count = allDocuments.filter(doc => doc.province === province).length
     return { name: province, count }
   })
   
   // จำนวนเอกสารแยกตามหมวดหมู่
   const documentsByCategory = categories.map(category => {
     const count = allDocuments.filter(doc => doc.categoryId === category.id).length
     return { 
       name: category.name, 
       count,
       color: getCategoryColor(category.id).primary 
     }
   })
   
   // จำนวนเอกสารตามเดือน (6 เดือนล่าสุด)
   const today = new Date()
   const sixMonthsAgo = new Date()
   sixMonthsAgo.setMonth(today.getMonth() - 5)
   
   const months = []
   for (let i = 0; i < 6; i++) {
     const date = new Date(sixMonthsAgo)
     date.setMonth(sixMonthsAgo.getMonth() + i)
     
     const year = date.getFullYear()
     const month = date.getMonth()
     
     const monthStart = new Date(year, month, 1)
     const monthEnd = new Date(year, month + 1, 0)
     
     const count = allDocuments.filter(doc => {
       const docDate = new Date(doc.createdAt)
       return docDate >= monthStart && docDate <= monthEnd
     }).length
     
     const thaiMonths = [
       'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
       'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
     ]
     
     months.push({
       date: `${thaiMonths[month]} ${year + 543}`,
       count
     })
   }
   
   // สีประจำโซน
   const zoneColors: Record<HealthZone, string> = {
     "north-upper": "#10b981",
     "north-lower": "#34d399",
     "northeast-upper": "#f59e0b",
     "northeast-lower": "#fbbf24", 
     "central": "#3b82f6",
     "east": "#8b5cf6",
     "west": "#ec4899", 
     "south-upper": "#06b6d4",
     "south-lower": "#67e8f9",
     "bangkok": "#f43f5e", 
   };
   
   // จำนวนเอกสารตามโซนสุขภาพ
   const zoneMap = new Map<HealthZone, number>();
   
   // เริ่มต้นค่าให้ทุกโซน
   Object.keys(zoneColors).forEach(zone => {
     zoneMap.set(zone as HealthZone, 0);
   });
   
   // นับเอกสารตามโซน
   allDocuments.forEach(doc => {
     const zone = getProvinceHealthZone(doc.province);
     zoneMap.set(zone, (zoneMap.get(zone) || 0) + 1);
   });
   
   // แปลงข้อมูลเป็นรูปแบบที่ใช้กับ PieChart
   const documentsByHealthZone = Array.from(zoneMap.entries())
     .filter(([_, count]) => count > 0) // เอาเฉพาะโซนที่มีเอกสาร
     .map(([zone, value]) => ({
       name: getThaiZoneName(zone),
       value,
       id: zone,
       color: zoneColors[zone]
     }))
     .sort((a, b) => b.value - a.value); // เรียงลำดับจากมากไปน้อย
   
   return {
     totalDocuments,
     publishedDocuments,
     unpublishedDocuments,
     totalCategories,
     provincesWithDocuments,
     documentsByProvince,
     documentsByCategory,
     documentsCreatedByMonth: months,
     documentsByHealthZone
   }
 } catch (error) {
   console.error('Error fetching dashboard statistics:', error)
   throw new Error('ไม่สามารถดึงข้อมูลสถิติได้')
 }
}