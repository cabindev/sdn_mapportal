// app/dashboard/page.tsx
import { getDashboardStatistics } from '@/app/lib/actions/statistics/get'
import DashboardCharts from './components/charts/DashboardCharts'
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
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ภาพรวมระบบ</h1>
        <p className="text-gray-600">สรุปข้อมูลสำคัญและสถิติการใช้งานระบบ</p>
      </div>

      {/* Statistics Summary Cards */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">สถิติโดยสรุป</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatisticCard 
            title="เอกสารทั้งหมด"
            value={statisticData.totalDocuments}
            icon={<DocumentIcon className="w-6 h-6" />}
            bgColor="bg-white"
            iconBgColor="bg-blue-600"
            textColor="text-gray-900"
            isClickable={false}
          />
          
          <StatisticCard 
            title="ประเภทงาน"
            value={statisticData.totalCategories}
            icon={<FolderIcon className="w-6 h-6" />}
            bgColor="bg-white"
            iconBgColor="bg-emerald-600"
            textColor="text-gray-900"
            isClickable={false}
          />
          
          <StatisticCard 
            title="พื้นที่/จังหวัด"
            value={statisticData.provincesWithDocuments}
            icon={<MapIcon className="w-6 h-6" />}
            bgColor="bg-white"
            iconBgColor="bg-purple-600"
            textColor="text-gray-900"
            isClickable={false}
          />
          
          <StatisticCard 
            title="เอกสารที่เผยแพร่"
            value={statisticData.publishedDocuments}
            icon={<ChartBarIcon className="w-6 h-6" />}
            bgColor="bg-white"
            iconBgColor="bg-orange-600"
            textColor="text-gray-900"
            isClickable={false}
          />
          
          <StatisticCard 
            title={`โซนสูงสุด (${topZone.name})`}
            value={topZone.value}
            icon={<GlobeAsiaAustraliaIcon className="w-6 h-6" />}
            bgColor="bg-white"
            iconBgColor="bg-indigo-600"
            textColor="text-gray-900"
            isClickable={false}
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">สถิติและแผนภูมิ</h2>
          <p className="text-gray-600 mt-1">ข้อมูลเชิงลึกและการวิเคราะห์</p>
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
  bgColor: string;
  iconBgColor: string;
  textColor: string;
  isClickable: boolean;
}

function StatisticCard({ 
  title, 
  value, 
  icon, 
  bgColor, 
  iconBgColor, 
  textColor 
}: StatisticCardProps) {
  return (
    <div className={`
      rounded-lg border border-gray-200 p-4 
      ${bgColor}
    `}>
      <div className="flex items-center space-x-3">
        {/* Icon */}
        <div className={`p-2 rounded-lg ${iconBgColor} text-white`}>
          {icon}
        </div>
        
        {/* Content */}
        <div>
          <h3 className="text-sm font-medium text-gray-600">
            {title}
          </h3>
          <p className={`text-2xl font-bold ${textColor}`}>
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

// ทำให้เว็บไซต์โหลดข้อมูลใหม่เสมอ ไม่ใช้ cache
export const dynamic = "force-dynamic"