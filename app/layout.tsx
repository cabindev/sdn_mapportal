// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import 'leaflet/dist/leaflet.css'
import SessionProvider from "./components/SessionProvider";
import { getServerSession } from "next-auth";
import authOptions from "./lib/configs/auth/authOptions";
import { Toaster } from "sonner";

export const metadata: Metadata = { 
  title: "SDN Map-portal",
  description: "ระบบแผนที่ดิจิทัลสำหรับการจัดการข้อมูลเชิงพื้นที่",
  keywords: ["แผนที่", "ระบบสารสนเทศภูมิศาสตร์", "GIS", "SDN"],
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '16x16 32x32',
        type: 'image/x-icon',
      },
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.ico',
    apple: {
      url: '/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
  },
  manifest: '/site.webmanifest',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="th" className="scroll-smooth">
      <body className="font-seppuri antialiased">
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