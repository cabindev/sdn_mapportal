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
    <div className="pt-0 max-w-full mx-auto">
      {/* สรุปข้อมูลสำคัญ - ปรับให้ใช้พื้นที่ให้เต็มที่ */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3 mb-3">
        <StatisticCard 
          title="เอกสารทั้งหมด"
          value={statisticData.totalDocuments}
          icon={<DocumentIcon className="w-5 h-5" />}
          href="/dashboard/documents"
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        
        <StatisticCard 
          title="ประเภทงาน"
          value={statisticData.totalCategories}
          icon={<FolderIcon className="w-5 h-5" />}
          href="/dashboard/categories"
          bgColor="bg-orange-50"
          textColor="text-orange-600"
        />
        
        <StatisticCard 
          title="พื้นที่/จังหวัด"
          value={statisticData.provincesWithDocuments}
          icon={<MapIcon className="w-5 h-5" />}
          href="/dashboard/map"
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        
        <StatisticCard 
          title="เอกสารที่เผยแพร่"
          value={statisticData.publishedDocuments}
          icon={<ChartBarIcon className="w-5 h-5" />}
          href="/dashboard/documents?published=true"
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
        
        <StatisticCard 
          title={`โซนสูงสุด (${topZone.name})`}
          value={topZone.value}
          icon={<GlobeAsiaAustraliaIcon className="w-5 h-5" />}
          href="/dashboard/map"
          bgColor="bg-cyan-50"
          textColor="text-cyan-600"
        />
      </div>
      
      {/* แผนภูมิแสดงสถิติ */}
      <DashboardCharts statisticData={statisticData} />
    </div>
  )
}

interface StatisticCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  bgColor: string;
  textColor: string;
}

function StatisticCard({ title, value, icon, href, bgColor, textColor }: StatisticCardProps) {
  return (
    <Link 
      href={href}
      className={`p-2 sm:p-3 md:p-4 rounded-lg ${bgColor} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-600 text-xs mb-0.5">{title}</h2>
          <p className={`text-base sm:text-xl md:text-2xl font-bold ${textColor}`}>{value.toLocaleString()}</p>
        </div>
        <div className={`${textColor} p-1.5 sm:p-2 rounded-full ${bgColor}`}>
          {icon}
        </div>
      </div>
    </Link>
  )
}

// ทำให้เว็บไซต์โหลดข้อมูลใหม่เสมอ ไม่ใช้ cache
export const dynamic = "force-dynamic"