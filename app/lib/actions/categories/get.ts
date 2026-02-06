// app/lib/actions/categories/get.ts
'use server'

import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import prisma from '../../db'
import { Prisma, CategoryDoc } from '@prisma/client'

export type CategoryWithCount = CategoryDoc & {
  _count: {
    documents: number
  }
}

export async function getCategories(): Promise<CategoryWithCount[]> {
  try {
    const categories = await prisma.categoryDoc.findMany({
      include: {
        _count: { 
          select: { documents: true } 
        }
      },
      orderBy: { 
        name: 'asc' 
      }
    })

    return categories
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch categories')
  }
}

export async function getCategory(id: string | number): Promise<CategoryDoc | null> {
  try {
    // แปลง id เป็น integer
    const categoryId = typeof id === 'string' ? parseInt(id, 10) : id

    if (isNaN(categoryId)) {
      return null
    }

    const category = await prisma.categoryDoc.findUnique({
      where: { 
        id: categoryId 
      },
      include: {
        _count: {
          select: { 
            documents: true 
          }
        }
      }
    })

    if (!category) {
      return null
    }

    return category
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch category')
  }
}