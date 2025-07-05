// app/dashboard/page.tsx
import { getDashboardStatistics } from '@/app/lib/actions/statistics/get'
import DashboardCharts from './components/charts/DashboardCharts'
import Link from 'next/link'
import { 
  DocumentIcon, 
  FolderIcon, 
  MapIcon, 
  ChartBarIcon,
  GlobeAsiaAustraliaIcon
} from '@heroicons/react/24/outline'

export default async function DashboardPage() {
  // ดึงข้อมูลสถิติสำหรับ Dashboard
  const statisticData = await getDashboardStatistics()
  
  // หาโซนที่มีเอกสารมากที่สุด
  const topZone = statisticData.documentsByHealthZone[0] || { name: '', value: 0 };
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ภาพรวมระบบ</h1>
        <p className="text-gray-600">สรุปข้อมูลสำคัญและสถิติการใช้งานระบบ</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatisticCard 
          title="เอกสารทั้งหมด"
          value={statisticData.totalDocuments}
          icon={<DocumentIcon className="w-6 h-6" />}
          href="/dashboard/documents"
          bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
          iconBgColor="bg-blue-500"
          textColor="text-blue-700"
          hoverColor="hover:from-blue-100 hover:to-blue-200"
        />
        
        <StatisticCard 
          title="ประเภทงาน"
          value={statisticData.totalCategories}
          icon={<FolderIcon className="w-6 h-6" />}
          href="/dashboard/categories"
          bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
          iconBgColor="bg-orange-500"
          textColor="text-orange-700"
          hoverColor="hover:from-orange-100 hover:to-orange-200"
        />
        
        <StatisticCard 
          title="พื้นที่/จังหวัด"
          value={statisticData.provincesWithDocuments}
          icon={<MapIcon className="w-6 h-6" />}
          href="/dashboard/map"
          bgColor="bg-gradient-to-br from-green-50 to-green-100"
          iconBgColor="bg-green-500"
          textColor="text-green-700"
          hoverColor="hover:from-green-100 hover:to-green-200"
        />
        
        <StatisticCard 
          title="เอกสารที่เผยแพร่"
          value={statisticData.publishedDocuments}
          icon={<ChartBarIcon className="w-6 h-6" />}
          href="/dashboard/documents?published=true"
          bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
          iconBgColor="bg-purple-500"
          textColor="text-purple-700"
          hoverColor="hover:from-purple-100 hover:to-purple-200"
        />
        
        <StatisticCard 
          title={`โซนสูงสุด (${topZone.name})`}
          value={topZone.value}
          icon={<GlobeAsiaAustraliaIcon className="w-6 h-6" />}
          href="/dashboard/map"
          bgColor="bg-gradient-to-br from-cyan-50 to-cyan-100"
          iconBgColor="bg-cyan-500"
          textColor="text-cyan-700"
          hoverColor="hover:from-cyan-100 hover:to-cyan-200"
        />
      </div>
      
      {/* Charts Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">สถิติและแผนภูมิ</h2>
          <p className="text-sm text-gray-600 mt-1">ข้อมูลเชิงลึกและการวิเคราะห์</p>
        </div>
        <div className="p-6">
          <DashboardCharts statisticData={statisticData} />
        </div>
      </div>
    </div>
  )
}

interface StatisticCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  bgColor: string;
  iconBgColor: string;
  textColor: string;
  hoverColor: string;
}

function StatisticCard({ 
  title, 
  value, 
  icon, 
  href, 
  bgColor, 
  iconBgColor, 
  textColor, 
  hoverColor 
}: StatisticCardProps) {
  return (
    <Link 
      href={href}
      className={`
        group relative overflow-hidden rounded-xl border border-gray-200 p-6 
        ${bgColor} ${hoverColor}
        hover:shadow-lg hover:shadow-gray-200/50 
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:-translate-y-1
      `}
    >
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/20 -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
      
      <div className="relative">
        {/* Icon */}
        <div className={`inline-flex p-3 rounded-xl ${iconBgColor} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        
        {/* Content */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
            {title}
          </h3>
          <p className={`text-3xl font-bold ${textColor} group-hover:scale-105 transition-transform duration-300 origin-left`}>
            {value.toLocaleString()}
          </p>
        </div>
        
        {/* Arrow indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

// ทำให้เว็บไซต์โหลดข้อมูลใหม่เสมอ ไม่ใช้ cache
export const dynamic = "force-dynamic"