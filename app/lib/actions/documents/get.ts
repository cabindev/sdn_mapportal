'use server'

import prisma from "../../db"
import { unstable_cache } from 'next/cache'

// Cache function for getting all documents
export const getDocuments = unstable_cache(
  async () => {
    try {
      const documents = await prisma.document.findMany({
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return documents
    } catch (error) {
      console.error('Error fetching documents:', error)
      throw new Error('ไม่สามารถดึงข้อมูลเอกสารได้')
    }
  },
  ['documents-list'],
  {
    revalidate: 60, // revalidate every 60 seconds
    tags: ['documents']
  }
)

// Cache function for getting only published documents
export const getPublishedDocuments = unstable_cache(
  async () => {
    try {
      const documents = await prisma.document.findMany({
        where: {
          isPublished: true // เฉพาะเอกสารที่มีการเผยแพร่
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return documents
    } catch (error) {
      console.error('Error fetching published documents:', error)
      throw new Error('ไม่สามารถดึงข้อมูลเอกสารที่เผยแพร่ได้')
    }
  },
  ['published-documents-list'],
  {
    revalidate: 60,
    tags: ['documents', 'published-documents']
  }
)

// Cache function for getting single document
export const getDocument = unstable_cache(
  async (id: string) => {
    try {
      const document = await prisma.document.findUnique({
        where: { 
          id: parseInt(id) 
        },
        include: {
          category: true,
        }
      })

      if (!document) {
        return null
      }

      return {
        ...document,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
      }
    } catch (error) {
      console.error('Error fetching document:', error)
      throw new Error('ไม่สามารถดึงข้อมูลเอกสารได้')
    }
  },
  ['document-detail'],
  {
    revalidate: 60,
    tags: ['documents']
  }
)

// Cache function for getting published document by ID
export const getPublishedDocument = unstable_cache(
  async (id: string) => {
    try {
      const document = await prisma.document.findFirst({
        where: { 
          id: parseInt(id),
          isPublished: true // ตรวจสอบด้วยว่าเอกสารมีการเผยแพร่
        },
        include: {
          category: true,
        }
      })

      if (!document) {
        return null
      }

      return {
        ...document,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
      }
    } catch (error) {
      console.error('Error fetching published document:', error)
      throw new Error('ไม่สามารถดึงข้อมูลเอกสารที่เผยแพร่ได้')
    }
  },
  ['published-document-detail'],
  {
    revalidate: 60,
    tags: ['documents', 'published-documents']
  }
)

// ฟังก์ชันสำหรับนับจำนวนเอกสารที่เผยแพร่
export const countPublishedDocuments = unstable_cache(
  async () => {
    try {
      const count = await prisma.document.count({
        where: {
          isPublished: true
        }
      })
      return count
    } catch (error) {
      console.error('Error counting published documents:', error)
      throw new Error('ไม่สามารถนับจำนวนเอกสารที่เผยแพร่ได้')
    }
  },
  ['published-documents-count'],
  {
    revalidate: 60,
    tags: ['documents', 'published-documents']
  }
)

// ฟังก์ชันสำหรับค้นหาเอกสารที่เผยแพร่ตามหมวดหมู่
export const getPublishedDocumentsByCategory = unstable_cache(
  async (categoryId: number) => {
    try {
      const documents = await prisma.document.findMany({
        where: {
          isPublished: true,
          categoryId: categoryId
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return documents
    } catch (error) {
      console.error('Error fetching published documents by category:', error)
      throw new Error('ไม่สามารถดึงข้อมูลเอกสารที่เผยแพร่ตามหมวดหมู่ได้')
    }
  },
  ['published-documents-by-category'],
  {
    revalidate: 60,
    tags: ['documents', 'published-documents', 'categories']
  }
)

// ฟังก์ชันสำหรับค้นหาเอกสารที่เผยแพร่ตามรายจังหวัด
export const getPublishedDocumentsByProvince = unstable_cache(
  async (province: string) => {
    try {
      const documents = await prisma.document.findMany({
        where: {
          isPublished: true,
          province: province
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return documents
    } catch (error) {
      console.error('Error fetching published documents by province:', error)
      throw new Error('ไม่สามารถดึงข้อมูลเอกสารที่เผยแพร่ตามจังหวัดได้')
    }
  },
  ['published-documents-by-province'],
  {
    revalidate: 60,
    tags: ['documents', 'published-documents']
  }
)