// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/lib/configs/auth/authOptions';

type RouteParams = {
  params: Promise<{ id: string }>
}

// สำหรับดึงข้อมูลผู้ใช้รายคน
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = Number(id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้' }, { status: 500 });
  }
}

// สำหรับอัปเดตข้อมูลผู้ใช้และเปลี่ยนสถานะ
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // ตรวจสอบสิทธิ์
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 });
    }

    const { id } = await params;
    const userId = Number(id);
    const { role } = await request.json();
    
    if (role && (role !== 'ADMIN' && role !== 'MEMBER')) {
      return NextResponse.json({ error: 'สถานะไม่ถูกต้อง' }, { status: 400 });
    }

    // ป้องกันการลดสถานะตัวเอง
    if (session.user.id === userId && role === 'MEMBER') {
      return NextResponse.json({ error: 'ไม่สามารถลดสถานะของตัวเองได้' }, { status: 400 });
    }

    // ตรวจสอบว่าจะเหลือ ADMIN อย่างน้อย 1 คน
    if (role === 'MEMBER') {
      const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { role: true }
      });

      if (user?.role === 'ADMIN') {
        const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
        if (adminCount <= 1) {
          return NextResponse.json({ error: 'ต้องมีผู้ดูแลระบบอย่างน้อย 1 คน' }, { status: 400 });
        }
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้' }, { status: 500 });
  }
}

// สำหรับลบผู้ใช้
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // ตรวจสอบสิทธิ์
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 });
    }

    const { id } = await params;
    const userId = Number(id);
    
    // ป้องกันการลบตัวเอง
    if (session.user.id === userId) {
      return NextResponse.json({ error: 'ไม่สามารถลบบัญชีของตัวเองได้' }, { status: 400 });
    }
    
    await prisma.user.delete({
      where: { id: userId },
    });
    
    return NextResponse.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: 'ไม่สามารถลบผู้ใช้ได้' }, { status: 500 });
  }
}