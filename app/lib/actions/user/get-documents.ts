// app/lib/actions/user/get-documents.ts
'use server'

import prisma from "@/app/lib/db"
import { unstable_cache } from 'next/cache'

// ฟังก์ชันสำหรับดึงเอกสารทั้งหมดของผู้ใช้
export const getUserDocuments = unstable_cache(
  async (userId: number) => {
    try {
      const documents = await prisma.document.findMany({
        where: {
          userId: userId
        },
        include: {
          category: true,
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })
      
      // แปลงวันที่เป็น string เพื่อส่งผ่าน API
      return documents.map(doc => ({
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      }))
    } catch (error) {
      console.error('Error fetching user documents:', error)
      throw new Error('ไม่สามารถดึงข้อมูลเอกสารของผู้ใช้ได้')
    }
  },
  ['user-documents'],
  {
    revalidate: 60, // revalidate every 60 seconds
    tags: ['documents', 'user-documents']
  }
)

// ฟังก์ชันสำหรับนับจำนวนเอกสารของผู้ใช้
export const countUserDocuments = unstable_cache(
  async (userId: number) => {
    try {
      const count = await prisma.document.count({
        where: {
          userId: userId
        }
      })
      return count
    } catch (error) {
      console.error('Error counting user documents:', error)
      throw new Error('ไม่สามารถนับจำนวนเอกสารของผู้ใช้ได้')
    }
  },
  ['user-documents-count'],
  {
    revalidate: 60,
    tags: ['documents', 'user-documents']
  }
)

// ฟังก์ชันสำหรับนับจำนวนเอกสารที่เผยแพร่ของผู้ใช้
export const countUserPublishedDocuments = unstable_cache(
  async (userId: number) => {
    try {
      const count = await prisma.document.count({
        where: {
          userId: userId,
          isPublished: true
        }
      })
      return count
    } catch (error) {
      console.error('Error counting user published documents:', error)
      throw new Error('ไม่สามารถนับจำนวนเอกสารที่เผยแพร่ของผู้ใช้ได้')
    }
  },
  ['user-published-documents-count'],
  {
    revalidate: 60,
    tags: ['documents', 'user-documents', 'published-documents']
  }
)

// ฟังก์ชันสำหรับนับจำนวนยอดเข้าชมและดาวน์โหลดของผู้ใช้
export const getUserDocumentsStats = unstable_cache(
    async (userId: number) => {
      try {
        const documents = await prisma.document.findMany({
          where: {
            userId: userId
          },
          select: {
            viewCount: true,
            downloadCount: true,
            isPublished: true
          }
        })
        
        const totalViews = documents.reduce((sum, doc) => sum + doc.viewCount, 0)
        const totalDownloads = documents.reduce((sum, doc) => sum + doc.downloadCount, 0)
        const publishedCount = documents.filter(doc => doc.isPublished).length
        const draftCount = documents.filter(doc => !doc.isPublished).length
        
        return {
          totalDocuments: documents.length,
          publishedCount,
          draftCount,
          totalViews,
          totalDownloads
        }
      } catch (error) {
        console.error('Error fetching user documents stats:', error)
        throw new Error('ไม่สามารถดึงข้อมูลสถิติเอกสารของผู้ใช้ได้')
      }
    },
    ['user-documents-stats'],
    {
      revalidate: 60,
      tags: ['documents', 'user-documents']
    }
   )