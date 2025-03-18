import type { Metadata } from "next";
import { Inter, Kanit } from 'next/font/google';
import "./globals.css";
import 'leaflet/dist/leaflet.css'
import SessionProvider from "./components/SessionProvider";
import Navbar from "./components/Navbar";
import { getServerSession } from "next-auth";
import authOptions from "./lib/configs/auth/authOptions";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const kanit = Kanit({
  weight: ['300', '400', '500', '600'],
  subsets: ['thai', 'latin'],
  variable: '--font-kanit',
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
      <body className={`${inter.variable} ${kanit.variable} font-sans antialiased`}>
        <SessionProvider session={session}>
          <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
            <Navbar />
          </header>
          <main className="pt-16 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
          <Toaster position="top-center" expand={true} richColors />
        </SessionProvider>
      </body>
    </html>
  );
}