// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb' 
    }
  },
  typescript: {
    ignoreBuildErrors: false
  },

  images: {
    unoptimized: true, // เพิ่มตัวเลือกนี้เพื่อปิดการ optimize ภาพ
    domains: ['sdnmapportal.sdnthailand.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sdnmapportal.sdnthailand.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // เพิ่ม revalidate เพื่อให้ระบบอัพเดทข้อมูลอัตโนมัติ
  staticPageGenerationTimeout: 180,
}

module.exports = nextConfig