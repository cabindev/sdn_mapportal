import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import 'leaflet/dist/leaflet.css'
import SessionProvider from "./components/SessionProvider";
import { getServerSession } from "next-auth";
import authOptions from "./lib/configs/auth/authOptions";
import { Toaster } from "sonner";
import FloatingDashboardButton from "./components/FloatingDashboardButton";

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

const prompt = localFont({
  src: [
    { path: './fonts/Prompt-300-thai.woff2', weight: '300', style: 'normal' },
    { path: './fonts/Prompt-300-latin.woff2', weight: '300', style: 'normal' },
    { path: './fonts/Prompt-400-thai.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Prompt-400-latin.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Prompt-500-thai.woff2', weight: '500', style: 'normal' },
    { path: './fonts/Prompt-500-latin.woff2', weight: '500', style: 'normal' },
    { path: './fonts/Prompt-600-thai.woff2', weight: '600', style: 'normal' },
    { path: './fonts/Prompt-600-latin.woff2', weight: '600', style: 'normal' },
    { path: './fonts/Prompt-700-thai.woff2', weight: '700', style: 'normal' },
    { path: './fonts/Prompt-700-latin.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-prompt',
  display: 'swap',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="th" className="scroll-smooth">
      <body className={`${prompt.variable} font-sans antialiased`}>
        <SessionProvider session={session}>
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
          <FloatingDashboardButton />
          <Toaster position="top-center" expand={true} richColors />
        </SessionProvider>
      </body>
    </html>
  );
}