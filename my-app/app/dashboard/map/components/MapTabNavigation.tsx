// components/MapTabNavigation.tsx
import { FiFilter, FiInfo, FiBarChart2, FiList } from 'react-icons/fi'

interface MapTabNavigationProps {
  activeTab: 'categories' | 'legend' | 'stats' | 'docs'
  setActiveTab: (tab: 'categories' | 'legend' | 'stats' | 'docs') => void
  unreadStats?: boolean // แสดงจุดแดงเมื่อมีสถิติใหม่
  newDocuments?: number // จำนวนเอกสารใหม่
}

export default function MapTabNavigation({ 
  activeTab, 
  setActiveTab,
  unreadStats,
  newDocuments
}: MapTabNavigationProps) {
  return (
    <div className="sticky top-[4.25rem] bg-white  px-2 py-1 border-b border-slate-200">
      <div className="flex">
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex-1 flex justify-center items-center py-2 px-1 text-sm font-medium rounded-md transition-colors ${
            activeTab === "categories"
              ? "bg-orange-50 text-orange-600"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <FiFilter className="mr-1.5" />
          หมวดหมู่
        </button>
        <button
          onClick={() => setActiveTab("legend")}
          className={`flex-1 flex justify-center items-center py-2 px-1 text-sm font-medium rounded-md transition-colors ${
            activeTab === "legend"
              ? "bg-orange-50 text-orange-600"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <FiInfo className="mr-1.5" />
          คำอธิบาย
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 flex justify-center items-center py-2 px-1 text-sm font-medium rounded-md transition-colors ${
            activeTab === "stats"
              ? "bg-orange-50 text-orange-600"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <div className="relative">
            <FiBarChart2 className="mr-1.5" />
            {unreadStats && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </div>
          สถิติ
        </button>
        <button
          onClick={() => setActiveTab("docs")}
          className={`flex-1 flex justify-center items-center py-2 px-1 text-sm font-medium rounded-md transition-colors ${
            activeTab === "docs"
              ? "bg-orange-50 text-orange-600"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <div className="relative">
            <FiList className="mr-1.5" />
            {newDocuments && newDocuments > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px]">
                {newDocuments > 9 ? '9+' : newDocuments}
              </span>
            )}
          </div>
          เอกสาร
        </button>
      </div>
    </div>
  )
}