// components/LegendTab.tsx
import { CategoryDoc } from '@prisma/client'
import { getCategoryColor } from '@/app/utils/colorGenerator'

interface LegendTabProps {
  categories: CategoryDoc[]
}

export default function LegendTab({ categories }: LegendTabProps) {
  return (
    <div className="p-4">
      {/* คำอธิบายสัญลักษณ์ */}
      <h2 className="font-medium text-slate-800 mb-3 flex items-center">
        <span className="inline-block w-1 h-5 bg-orange-500 mr-2 rounded-sm"></span>
        คำอธิบายสัญลักษณ์บนแผนที่
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        {categories.map((category) => {
          const colorScheme = getCategoryColor(category.id);
          return (
            <div
              key={category.id}
              className="flex items-center p-2.5 bg-white rounded-lg shadow-sm border border-slate-200 hover:border-orange-200 transition-colors"
            >
              <div className="mr-2 flex-shrink-0">
                <span
                  className="block w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: colorScheme.primary }}
                ></span>
              </div>
              <span className="text-sm text-slate-700 font-medium">
                {category.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* วิธีใช้งานแผนที่ */}
      <h2 className="font-medium text-slate-800 mt-5 mb-3 flex items-center">
        <span className="inline-block w-1 h-5 bg-orange-500 mr-2 rounded-sm"></span>
        วิธีใช้งานแผนที่
      </h2>
      <div className="space-y-3">
        <div className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:border-orange-200 transition-colors">
          <div className="bg-orange-50 text-orange-600 w-7 h-7 rounded-lg flex items-center justify-center font-medium mr-3 flex-shrink-0 shadow-sm">
            1
          </div>
          <div>
            <h3 className="font-medium text-slate-800 mb-0.5">เพิ่มเอกสารใหม่</h3>
            <p className="text-sm text-slate-600">คลิกที่แผนที่หรือปุ่ม "เพิ่มเอกสาร" ด้านบน</p>
          </div>
        </div>
        <div className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:border-orange-200 transition-colors">
          <div className="bg-orange-50 text-orange-600 w-7 h-7 rounded-lg flex items-center justify-center font-medium mr-3 flex-shrink-0 shadow-sm">
            2
          </div>
          <div>
            <h3 className="font-medium text-slate-800 mb-0.5">ดูเอกสาร</h3>
            <p className="text-sm text-slate-600">คลิกที่จุดบนแผนที่เพื่อดูรายละเอียดเอกสาร</p>
          </div>
        </div>

        <div className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:border-orange-200 transition-colors">
          <div className="bg-orange-50 text-orange-600 w-7 h-7 rounded-lg flex items-center justify-center font-medium mr-3 flex-shrink-0 shadow-sm">
            3
          </div>
          <div>
            <h3 className="font-medium text-slate-800 mb-0.5">กรองข้อมูล</h3>
            <p className="text-sm text-slate-600">เลือกหมวดหมู่ที่ต้องการให้แสดงผลในแท็บ "หมวดหมู่"</p>
          </div>
        </div>
      </div>
    </div>
  )
}