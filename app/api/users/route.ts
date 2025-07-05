// app/api/users/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/lib/configs/auth/authOptions';

export async function GET() {
  try {
    // ตรวจสอบสิทธิ์ (optional แต่แนะนำให้ใช้)
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้' }, { status: 500 });
  }
}