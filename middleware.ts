import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // กรณีเข้าหน้า dashboard ต้องเป็น admin เท่านั้น
  if (pathname.startsWith('/dashboard') && (!token || token.role !== 'ADMIN')) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // กรณีเข้าหน้า /auth/signin แล้วมี session อยู่แล้ว ให้ redirect ไปหน้า /dashboard
  if (pathname.startsWith('/auth/signin') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/signin'],
};