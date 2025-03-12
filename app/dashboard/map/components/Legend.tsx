// app/dashboard/map/components/Legend.tsx
import { CategoryDoc } from '@prisma/client';
import { getCategoryColor } from '@/app/utils/colorGenerator';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiInfo } from 'react-icons/fi';

interface LegendProps {
  categories: CategoryDoc[];
}

export default function Legend({ categories }: LegendProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="absolute z-[1000] top-4 right-4">
      <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden max-w-[300px]">
        <div 
          className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h3 className="font-medium text-slate-800 text-sm flex items-center">
            <FiInfo className="mr-1.5 text-orange-500" />
            คำอธิบายสัญลักษณ์
          </h3>
          <button className="text-slate-500 hover:text-slate-700">
            {isOpen ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
        
        {isOpen && (
          <div className="p-3">
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {categories.map(category => {
                const colorScheme = getCategoryColor(category.id);
                return (
                  <div key={category.id} className="flex items-center">
                    <span 
                      className="w-4 h-4 rounded-full mr-2 flex-shrink-0 border-2 border-white shadow-sm"
                      style={{ backgroundColor: colorScheme.primary }}
                    ></span>
                    <span className="text-sm text-slate-700 truncate">{category.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}