// components/MapHeader.tsx
import { FiMap, FiFilter, FiLayers, FiBarChart2 } from 'react-icons/fi'

interface MapHeaderProps {
  documentsCount: number
  filteredCount: number
  toggleAllCategories: () => void
  selectedCategories: number[]
  categoriesCount: number
  onAddNewDocument?: () => void
}

export default function MapHeader({
  documentsCount,
  filteredCount,
  toggleAllCategories,
  selectedCategories,
  categoriesCount,
  onAddNewDocument
}: MapHeaderProps) {
  return (
    <div className="border-b border-slate-200 px-6 py-3 flex-shrink-0">
      <div className="container mx-auto flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center">
          <FiMap className="text-orange-500 mr-2 text-xl" />
          <h1 className="text-lg font-bold text-slate-800">
            ระบบแผนที่เอกสารดิจิทัลประเทศไทย
          </h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1.5 bg-slate-100 rounded-md text-sm text-slate-700 flex items-center">
              <FiLayers className="mr-1 text-orange-500" />
              {documentsCount} เอกสาร
            </span>
            <span className="px-2.5 py-1.5 bg-orange-50 rounded-md text-sm text-orange-600 flex items-center">
              <FiBarChart2 className="mr-1" />
              {filteredCount} รายการที่แสดง
            </span>
          </div>
          <button
            onClick={toggleAllCategories}
            className="text-sm px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-md transition-colors flex items-center border border-slate-200"
          >
            <FiFilter className="mr-1.5 text-orange-500" />
            {selectedCategories.length === categoriesCount
              ? "ยกเลิกการเลือกทั้งหมด"
              : "เลือกทั้งหมด"}
          </button>
        </div>
      </div>
    </div>
  )
}