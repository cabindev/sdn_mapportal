// app/google/components/GoogleRightSidebar.tsx
"use client";

import { useState, useMemo } from "react";
import { 
  Filter,
  Eye,
  EyeOff,
  BarChart3
} from "lucide-react";
import { CategoryDoc } from "@prisma/client";
import { DocumentWithCategory } from "@/app/types/document";
import { getCategoryColor } from "@/app/utils/colorGenerator";
import StatsTab from "../../dashboard/map/components/StatsTab";

interface GoogleRightSidebarProps {
  categories: CategoryDoc[];
  selectedCategories: number[];
  setSelectedCategories: (ids: number[]) => void;
  documents: DocumentWithCategory[];
  onHoverDocument: (documentId: number | null) => void;
  onSearchClick: () => void;
}

type PanelType = 'filter' | 'stats' | null;

export default function GoogleRightSidebar({
  categories,
  selectedCategories,
  setSelectedCategories,
  documents,
  onHoverDocument,
  onSearchClick
}: GoogleRightSidebarProps) {
  const [activePanel, setActivePanel] = useState<PanelType>(null);

  // คำนวณสถิติ
  const stats = useMemo(() => {
    const total = documents.length;
    const filtered = documents.filter(doc => 
      selectedCategories.length === 0 || selectedCategories.includes(doc.categoryId)
    );
    
    const byCategory = categories.map(cat => ({
      ...cat,
      count: documents.filter(doc => doc.categoryId === cat.id).length
    }));

    // คำนวณสถิติเพิ่มเติม
    const totalViews = documents.reduce((sum, doc) => sum + (doc.viewCount || 0), 0);
    const totalDownloads = documents.reduce((sum, doc) => sum + (doc.downloadCount || 0), 0);
    
    // หาหมวดหมู่ที่มีเอกสารมากที่สุด
    const mostPopularCategory = byCategory.reduce((max, cat) => 
      cat.count > max.count ? cat : max, byCategory[0] || { count: 0, name: 'ไม่มีข้อมูล' }
    );
    
    return { 
      total, 
      filtered: filtered.length, 
      byCategory,
      totalViews,
      totalDownloads,
      mostPopularCategory
    };
  }, [documents, selectedCategories, categories]);



  const togglePanel = (panel: PanelType) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <>
      {/* Vertical Icon Panel - ปรับตำแหน่งให้ไม่ทับเครื่องมือ Google Maps */}
      <div className="absolute top-20 right-4 z-[900] flex flex-col gap-3">
        {/* Filter Button */}
        <button
          type="button"
          onClick={() => togglePanel('filter')}
          className={`p-2 rounded-lg transition-all duration-200 ${
            activePanel === 'filter' 
              ? 'bg-gray-900 text-white' 
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-gray-900 shadow-sm'
          }`}
          title="กรองข้อมูลตามประเภท"
        >
          <Filter className="w-4 h-4" />
        </button>

        {/* Stats Button */}
        <button
          type="button"
          onClick={() => togglePanel('stats')}
          className={`p-2 rounded-lg transition-all duration-200 ${
            activePanel === 'stats' 
              ? 'bg-gray-900 text-white' 
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-gray-900 shadow-sm'
          }`}
          title="สถิติข้อมูล"
        >
          <BarChart3 className="w-4 h-4" />
        </button>

      </div>

      {/* Filter Panel */}
      {activePanel === 'filter' && (
        <div className="absolute top-20 right-16 z-[900] w-80 bg-white/95 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 p-4 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4" />
                กรองข้อมูลตามประเภท
              </h3>
              <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full font-light">
                {stats.filtered}/{stats.total} รายการ
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto p-4">
            <div className="space-y-3">
              {/* Quick Actions */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setSelectedCategories(categories.map(c => c.id))}
                  className="flex-1 px-3 py-2 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  แสดงทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategories([])}
                  className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  ซ่อนทั้งหมด
                </button>
              </div>

              {/* Categories List */}
              <div className="space-y-2">
                {categories.map((category) => {
                  const count = stats.byCategory.find(c => c.id === category.id)?.count || 0;
                  const isVisible = selectedCategories.includes(category.id);
                  
                  return (
                    <div
                      key={category.id}
                      className={`group p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                        isVisible 
                          ? 'bg-gray-50 border-gray-300 shadow-sm' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (isVisible) {
                          setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                        } else {
                          setSelectedCategories([...selectedCategories, category.id]);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Color Indicator */}
                        <div
                          className="w-4 h-4 rounded flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: getCategoryColor(category.id).primary }}
                        />
                        
                        {/* Category Info */}
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="text-xs font-medium text-gray-800 leading-tight truncate">
                            {category.name}
                          </div>
                          {category.description && (
                            <div className="text-xs text-gray-500 font-light leading-tight truncate">
                              {category.description}
                            </div>
                          )}
                        </div>
                        
                        {/* Count and Visibility */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-light">
                            {count}
                          </span>
                          <div className="p-1">
                            {isVisible ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Empty State */}
              {categories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">ไม่มีหมวดหมู่ข้อมูล</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Panel */}
      {activePanel === 'stats' && (
        <div className="absolute top-20 right-16 z-[900] w-96 bg-white/95 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 p-4 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                สถิติข้อมูล
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            <StatsTab categories={categories} documents={documents} />
          </div>
        </div>
      )}

    </>
  );
}