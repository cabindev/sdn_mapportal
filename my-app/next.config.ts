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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sdnmapportal.sdnthailand.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleapis.com',
        pathname: '/**',
      },
            {
        protocol: 'https',
        hostname: '*.google.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig