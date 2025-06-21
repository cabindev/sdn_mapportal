// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from 'next/font/google'; // ✅ ใช้แค่ Inter
import "./globals.css";
import 'leaflet/dist/leaflet.css'
import SessionProvider from "./components/SessionProvider";

import { getServerSession } from "next-auth";
import authOptions from "./lib/configs/auth/authOptions";
import { Toaster } from "sonner";

// ✅ โหลด Inter อย่างเดียว
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = { 
  title: "SDN Map-portal",
  description: "ระบบแผนที่ดิจิทัลสำหรับการจัดการข้อมูลเชิงพื้นที่",
  keywords: ["แผนที่", "ระบบสารสนเทศภูมิศาสตร์", "GIS", "SDN"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="th" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider session={session}>
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
          <Toaster position="top-center" expand={true} richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
