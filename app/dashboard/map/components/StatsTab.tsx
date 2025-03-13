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
          className={`py-1.5 px-4 text-sm rounded-md transition-colors ${
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
          className={`py-1.5 px-4 text-sm rounded-md transition-colors ${
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
          <h2 className="font-medium text-slate-800 mb-4 flex items-center">
            <span className="inline-block w-1 h-5 bg-orange-500 mr-2 rounded-sm"></span>
            สัดส่วนเอกสารตามหมวดหมู่
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <div key={cat.id} className="bg-slate-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: colorScheme.primary }}
                      ></span>
                      <span className="text-sm text-slate-800 font-medium truncate">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md shadow-sm">
                      {count} รายการ
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mr-2 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: colorScheme.primary,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-slate-600 bg-white px-1.5 py-0.5 rounded w-12 text-center shadow-sm">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* สรุปจำนวนเอกสารทั้งหมด */}
          <div className="mt-4 p-3 bg-orange-50 rounded-lg text-center">
            <span className="text-orange-700 font-medium">
              รวมทั้งหมด {documents.length} เอกสาร จาก {categories.length} หมวดหมู่
            </span>
          </div>
        </div>
      )}

      {/* สถิติตามภูมิภาค */}
      {view === 'region' && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="font-medium text-slate-800 mb-4 flex items-center">
            <span className="inline-block w-1 h-5 bg-orange-500 mr-2 rounded-sm"></span>
            จำนวนเอกสารตามภูมิภาค
          </h2>
          <RegionalStats documents={documents} />
        </div>
      )}
    </div>
  )
}