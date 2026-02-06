// app/dashboard/map/components/CategoryFilter.tsx
'use client'

import { CategoryDoc } from '@prisma/client'
import { DocumentWithCategory } from '@/app/types/document'
import { getCategoryColor } from '@/app/utils/colorGenerator'

interface CategoryFilterProps {
  categories: CategoryDoc[];
  selectedCategories: number[];
  setSelectedCategories: (ids: number[]) => void;
  documents: DocumentWithCategory[];
}

export default function CategoryFilter({ 
  categories,
  selectedCategories,
  setSelectedCategories,
  documents
}: CategoryFilterProps) {
  return (
    <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg z-[400] min-w-[300px]">
      <h4 className="font-medium mb-3 text-slate-900">กรองตามหมวดหมู่</h4>
      <select
        value={selectedCategories.length === 1 ? selectedCategories[0] : ''}
        onChange={(e) => {
          const value = e.target.value;
          if (value === '') {
            setSelectedCategories(categories.map(c => c.id));
          } else {
            setSelectedCategories([parseInt(value)]);
          }
        }}
        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-slate-700 mb-3"
      >
        <option value="">📍 ทุกหมวดหมู่ ({documents.length})</option>
        {categories.map(cat => {
          const docsCount = documents.filter(d => d.categoryId === cat.id).length;
          const colorScheme = getCategoryColor(cat.id);
          return (
            <option 
              key={cat.id} 
              value={cat.id}
              style={{ 
                backgroundColor: `${colorScheme.primary}10`,
                color: colorScheme.primary
              }}
            >
              {cat.name} ({docsCount})
            </option>
          );
        })}
      </select>
      
      <div className="flex flex-wrap gap-2 mt-2">
        <button
          onClick={() => setSelectedCategories(categories.map(c => c.id))}
          className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          แสดงทั้งหมด
        </button>
        <button
          onClick={() => setSelectedCategories([])}
          className="px-3 py-1.5 text-sm bg-slate-500 text-white rounded hover:bg-slate-600 transition-colors"
        >
          ซ่อนทั้งหมด
        </button>
      </div>
    </div>
  );
}