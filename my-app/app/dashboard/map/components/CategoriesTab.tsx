// components/CategoriesTab.tsx
import { CategoryDoc } from '@prisma/client'
import { DocumentWithCategory } from '@/app/types/document'
import { getCategoryColor } from '@/app/utils/colorGenerator'

interface CategoriesTabProps {
  categories: CategoryDoc[]
  documents: DocumentWithCategory[]
  selectedCategories: number[]
  toggleCategory: (categoryId: number) => void
}

export default function CategoriesTab({
  categories,
  documents,
  selectedCategories,
  toggleCategory
}: CategoriesTabProps) {
  return (
    <div className="p-4">
      {/* รายการหมวดหมู่ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {categories.map((cat) => {
          const colorScheme = getCategoryColor(cat.id)
          const isSelected = selectedCategories.includes(cat.id)
          const count = documents.filter(
            (d) => d.categoryId === cat.id
          ).length

          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`py-2 px-3 text-sm rounded-lg transition-all duration-200 flex flex-col ${
                isSelected
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <div className="flex items-center mb-1">
                <span
                  className="w-3 h-3 rounded-full mr-1.5 flex-shrink-0"
                  style={{ backgroundColor: colorScheme.primary }}
                ></span>
                <span className="truncate">{cat.name}</span>
              </div>
              <div
                className={`text-xs ${
                  isSelected ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {count} เอกสาร
              </div>
            </button>
          )
        })}
      </div>
      
      {/* แสดงจำนวนที่เลือก */}
      {selectedCategories.length > 0 && (
        <div className="mt-3 text-sm text-slate-600 bg-slate-50 py-1.5 px-3 rounded-md">
          เลือก {selectedCategories.length} จาก {categories.length} หมวดหมู่
        </div>
      )}
    </div>
  )
}