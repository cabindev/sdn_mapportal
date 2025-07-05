// lib/actions/documents/search.ts
'use server'

import prisma from "@/app/lib/db"
import { DocumentWithCategory } from "@/app/types/document";

export async function searchDocuments({
  search = "",
  categoryId,
  page = 1,
  limit = 10
}: {
  search?: string,
  categoryId?: number | undefined,
  page?: number,
  limit?: number
}) {
  try {
    // สร้าง filter สำหรับค้นหา
    const where = {
      ...(search ? {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      } : {}),
      ...(categoryId ? { categoryId } : {}), // เพิ่ม filter ตาม categoryId
    };

    const skip = (page - 1) * limit;

    // ดึงข้อมูลโดยตรงโดยไม่ใช้ cache
    const [documents, totalDocuments, totalStats] = await Promise.all([
      prisma.document.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }) as Promise<DocumentWithCategory[]>,
      
      prisma.document.count({ where }),
      
      Promise.all([
        prisma.document.count(),
        prisma.document.count({ where: { isPublished: true } }),
        prisma.document.count({ where: { isPublished: false } })
      ])
    ]);

    // เตรียมข้อมูลสถิติ
    const stats = {
      all: totalStats[0],
      published: totalStats[1],
      unpublished: totalStats[2]
    };

    // แปลงข้อมูลให้พร้อมใช้
    const serializedDocuments = documents.map(doc => {
      let coverImage = doc.coverImage || null;
      if (coverImage && !coverImage.startsWith('/')) {
        coverImage = `/${coverImage}`; 
      }
      
      return {
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        coverImage: coverImage,
      };
    });

    // คำนวณข้อมูล pagination
    const totalPages = Math.ceil(totalDocuments / limit);

    return {
      documents: serializedDocuments,
      pagination: {
        totalItems: totalDocuments,
        totalPages,
        currentPage: page,
        limit
      },
      stats
    };
  } catch (error) {
    console.error("Error searching documents:", error);
    throw new Error("เกิดข้อผิดพลาดในการค้นหาเอกสาร");
  }
}