'use server'

import prisma from "@/app/lib/db"
import { unstable_cache } from 'next/cache'
import { HealthZone, getProvinceHealthZone } from '@/app/utils/healthZones';

export const getProvincesWithStatsByRegion = unstable_cache(
  async (region: string = 'all') => {
    try {
      // ดึงข้อมูลจังหวัดทั้งหมดก่อน
      const allProvinces = await getProvincesWithStats();
      
      // ถ้าเลือก 'all' ให้แสดงทั้งหมด
      if (region === 'all') {
        return allProvinces;
      }
      
      // กรองเฉพาะจังหวัดที่อยู่ในภูมิภาคที่เลือก
      return allProvinces.filter(province => 
        getProvinceHealthZone(province.name) === region
      );
    } catch (error) {
      console.error('Error fetching provinces by region:', error);
      throw new Error('ไม่สามารถดึงข้อมูลจังหวัดตามภูมิภาคได้');
    }
  },
  ['provinces-with-stats-by-region'],
  {
    revalidate: 3600,
    tags: ['provinces', 'documents', 'statistics']
  }
);

// ดึงข้อมูลจังหวัดทั้งหมดที่มีเอกสาร พร้อมจำนวนเอกสาร
export const getProvinces = unstable_cache(
  async () => {
    try {
      // ดึงข้อมูลจังหวัดทั้งหมดที่มีเอกสาร พร้อมนับจำนวนเอกสาร
      const provinces = await prisma.document.groupBy({
        by: ['province'],
        _count: {
          id: true
        },
        orderBy: {
          province: 'asc'
        }
      })

      return provinces.map(p => ({
        name: p.province,
        count: p._count.id
      }))
    } catch (error) {
      console.error('Error fetching provinces:', error)
      throw new Error('ไม่สามารถดึงข้อมูลจังหวัดได้')
    }
  },
  ['provinces-list'],
  {
    revalidate: 3600, // revalidate every hour
    tags: ['provinces', 'documents']
  }
)

// ดึงข้อมูลเอกสารทั้งหมดในจังหวัดนั้นๆ
export const getDocumentsByProvince = unstable_cache(
  async (province: string) => {
    try {
      const documents = await prisma.document.findMany({
        where: {
          province: province
        },
        include: {
          category: true,
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return documents.map(doc => ({
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
      }))
    } catch (error) {
      console.error(`Error fetching documents for province ${province}:`, error)
      throw new Error(`ไม่สามารถดึงข้อมูลเอกสารสำหรับจังหวัด ${province} ได้`)
    }
  },
  ['documents-by-province'],
  {
    revalidate: 3600,
    tags: ['documents', 'provinces']
  }
)

// ดึงข้อมูลสถิติประเภทเอกสารแต่ละจังหวัด
export const getCategoryStatsByProvince = unstable_cache(
  async (province: string) => {
    try {
      // จำนวนเอกสารแยกตามหมวดหมู่
      const categoryStats = await prisma.document.groupBy({
        by: ['categoryId'],
        _count: {
          id: true
        },
        where: {
          province: province
        }
      })

      // ดึงข้อมูลชื่อหมวดหมู่
      const categories = await prisma.categoryDoc.findMany({
        where: {
          id: {
            in: categoryStats.map(c => c.categoryId)
          }
        }
      })

      // รวมข้อมูลสถิติ
      const documentsByCategory = categoryStats.map(stat => {
        const category = categories.find(c => c.id === stat.categoryId)
        return {
          id: stat.categoryId,
          name: category?.name || 'ไม่ระบุหมวดหมู่',
          count: stat._count.id
        }
      })

      return documentsByCategory
    } catch (error) {
      console.error(`Error fetching category stats for province ${province}:`, error)
      throw new Error(`ไม่สามารถดึงข้อมูลสถิติตามหมวดหมู่สำหรับจังหวัด ${province} ได้`)
    }
  },
  ['province-category-stats'],
  {
    revalidate: 3600,
    tags: ['documents', 'provinces', 'categories']
  }
)

// ดึงข้อมูลจังหวัดทั้งหมดพร้อมสถิติ (สำหรับตาราง)
export const getProvincesWithStats = unstable_cache(
  async () => {
    try {
      // 1. ดึงข้อมูลจังหวัดทั้งหมดที่มีเอกสาร
      const provinces = await prisma.document.groupBy({
        by: ['province'],
        _count: {
          id: true
        },
        orderBy: {
          province: 'asc'
        }
      })

      // 2. ดึงข้อมูลจำนวนเอกสารที่เผยแพร่แล้ว
      const publishedCounts = await prisma.document.groupBy({
        by: ['province'],
        _count: {
          id: true
        },
        where: {
          isPublished: true
        }
      })

      // 3. ดึงข้อมูลจำนวนหมวดหมู่ที่มีเอกสาร
      // เปลี่ยนประเภทข้อมูลเป็น bigint เพราะนี่คือประเภทที่แท้จริงที่ส่งกลับมาจาก SQL
      const rawResults = await prisma.$queryRaw`
        SELECT 
          d.province,
          COUNT(DISTINCT d.categoryId) as categoryCount
        FROM Document d
        GROUP BY d.province
      ` as Array<{ province: string, categoryCount: bigint }> // แก้เป็น bigint

      // แปลง BigInt เป็น Number ก่อนใช้งาน
      const categoryCountsByProvince = rawResults.map(item => ({
        province: item.province,
        categoryCount: Number(item.categoryCount) // แปลง BigInt เป็น Number
      }));

      // 4. รวมข้อมูลทั้งหมด
      const result = provinces.map(p => {
        const published = publishedCounts.find(pc => pc.province === p.province);
        const categoryCounts = categoryCountsByProvince.find(cc => cc.province === p.province);
        
        return {
          name: p.province,
          totalDocuments: p._count.id,
          publishedDocuments: published?._count.id || 0,
          categoryCount: categoryCounts?.categoryCount || 0
        }
      })

      return result
    } catch (error) {
      console.error('Error fetching provinces with stats:', error)
      throw new Error('ไม่สามารถดึงข้อมูลสถิติจังหวัดได้')
    }
  },
  ['provinces-with-stats'],
  {
    revalidate: 3600,
    tags: ['provinces', 'documents', 'statistics']
  }
)