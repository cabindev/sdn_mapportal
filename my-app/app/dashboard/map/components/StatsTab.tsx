// components/StatsTab.tsx
import { CategoryDoc } from '@prisma/client'
import { DocumentWithCategory } from '@/app/types/document'
import { getCategoryColor } from '@/app/utils/colorGenerator'
import RegionalStats from './RegionalStats'
import { useState } from 'react'
import { FiBarChart2, FiMap } from 'react-icons/fi'

interface StatsTabProps {
  categories: CategoryDoc[]
  documents: DocumentWithCategory[]
}

export default function StatsTab({ categories, documents }: StatsTabProps) {
  const [view, setView] = useState<'category' | 'region'>('category')
  
  return (
    <div className="p-4">
      {/* Toggle เปลี่ยนมุมมอง */}
      <div className="bg-slate-100 p-1 rounded-lg inline-flex mb-4">
        <button
          onClick={() => setView('category')}
          className={`py-1.5 px-4 text-xs rounded-md transition-colors ${
            view === 'category' 
              ? 'bg-white shadow-sm text-slate-800 font-medium' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FiBarChart2 className="inline-block mr-1.5" />
          หมวดหมู่
        </button>
        <button
          onClick={() => setView('region')}
          className={`py-1.5 px-4 text-xs rounded-md transition-colors ${
            view === 'region' 
              ? 'bg-white shadow-sm text-slate-800 font-medium' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FiMap className="inline-block mr-1.5" />
          ภูมิภาค
        </button>
      </div>

      {/* สถิติตามหมวดหมู่ */}
      {view === 'category' && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="font-light text-xs text-slate-800 mb-4 flex items-center">
            <span className="inline-block w-1 h-5 bg-orange-500 mr-2 rounded-sm"></span>
            สัดส่วนเอกสารตามหมวดหมู่
          </h2>
          
          <div className="space-y-3">
            {categories.map((cat) => {
              const count = documents.filter(
                (d) => d.categoryId === cat.id
              ).length;
              const colorScheme = getCategoryColor(cat.id);
              const percentage =
                documents.length > 0
                  ? Math.round((count / documents.length) * 100)
                  : 0;

              return (
                <div key={cat.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  {/* Left: Color + Name */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colorScheme.primary }}
                    />
                    <span className="text-xs font-medium text-gray-800 truncate">
                      {cat.name}
                    </span>
                  </div>
                  
                  {/* Center: Progress Bar */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: colorScheme.primary,
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Right: Count + Percentage */}
                  <div className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-600">
                    <span className="font-light">{count}</span>
                    <span className="font-medium">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* สรุปจำนวนเอกสารทั้งหมด */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600 font-light">รวมทั้งหมด</span>
              <span className="font-medium text-gray-800">{documents.length} เอกสาร</span>
            </div>
            <div className="flex justify-between items-center text-xs mt-1">
              <span className="text-gray-600 font-light">จำนวนหมวดหมู่</span>
              <span className="font-medium text-gray-800">{categories.length} หมวดหมู่</span>
            </div>
          </div>
        </div>
      )}

      {/* สถิติตามภูมิภาค */}
      {view === 'region' && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="font-light text-xs text-slate-800 mb-4 flex items-center">
            <span className="inline-block w-1 h-5 bg-orange-500 mr-2 rounded-sm"></span>
            จำนวนเอกสารตามภูมิภาค
          </h2>
          <RegionalStats documents={documents} />
        </div>
      )}
    </div>
  )
}