// app/dashboard/map/components/RightSidebar.tsx
"use client";

import { useState, useMemo } from "react";
import { 
  Search,
  Filter,
  X,
  Eye,
  EyeOff,
  FileText,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { CategoryDoc } from "@prisma/client";
import { DocumentWithCategory } from "@/app/types/document";

interface RightSidebarProps {
  categories: CategoryDoc[];
  selectedCategories: number[];
  setSelectedCategories: (ids: number[]) => void;
  documents: DocumentWithCategory[];
  onHoverDocument: (documentId: number | null) => void;
  onSearchClick: () => void;
}

type PanelType = 'filter' | 'search' | 'stats' | null;

export default function RightSidebar({
  categories,
  selectedCategories,
  setSelectedCategories,
  documents,
  onHoverDocument,
  onSearchClick
}: RightSidebarProps) {
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

  // กำหนดสี Tailwind สำหรับแต่ละหมวดหมู่
  const getCategoryColor = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('ที่ดิน') || name.includes('land')) return 'bg-green-500';
    if (name.includes('สาธารณะ') || name.includes('public')) return 'bg-blue-500';
    if (name.includes('อาคาร') || name.includes('building')) return 'bg-gray-500';
    if (name.includes('ป่า') || name.includes('forest')) return 'bg-emerald-600';
    if (name.includes('น้ำ') || name.includes('water')) return 'bg-cyan-500';
    return 'bg-purple-500';
  };

  // แปลงชื่อหมวดหมู่เป็นภาษาไทย
  const getCategoryDescription = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('land')) return 'พื้นที่ดิน';
    if (name.includes('public')) return 'พื้นที่สาธารณะ';
    if (name.includes('green')) return 'พื้นที่สีเขียว';
    if (name.includes('building')) return 'อาคารและสิ่งปลูกสร้าง';
    if (name.includes('water')) return 'แหล่งน้ำ';
    return 'อื่นๆ';
  };

  const togglePanel = (panel: PanelType) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <>
      {/* Vertical Icon Panel - ปรับตำแหน่งให้ไม่ทับปุ่ม zoom */}
      <div className="absolute top-44 right-4 z-[900] flex flex-col gap-3">
        {/* Filter Button */}
        <button
          onClick={() => togglePanel('filter')}
          className={`p-3 rounded-xl shadow-lg transition-all duration-200 border ${
            activePanel === 'filter' 
              ? 'bg-gray-900 text-white hover:bg-gray-800 border-gray-900'
              : 'bg-white/95 hover:bg-white border-gray-200 group'
          }`}
          title="กรองข้อมูล"
        >
          <Filter className={`w-5 h-5 ${
            activePanel !== 'filter' ? 'group-hover:text-gray-900' : ''
          }`} />
        </button>

        {/* Stats Button */}
        <button
          onClick={() => togglePanel('stats')}
          className={`p-3 rounded-xl shadow-lg transition-all duration-200 border ${
            activePanel === 'stats'
              ? 'bg-gray-900 text-white hover:bg-gray-800 border-gray-900'
              : 'bg-white/95 hover:bg-white border-gray-200 group'
          }`}
          title="สถิติข้อมูล"
        >
          <BarChart3 className={`w-5 h-5 ${
            activePanel !== 'stats' ? 'group-hover:text-gray-900' : ''
          }`} />
        </button>

        {/* Search Button - ตัดการแสดงช่องค้นหาเมื่อ hover ออก */}
        <button
          onClick={() => togglePanel('search')}
          className={`p-3 rounded-xl shadow-lg transition-all duration-200 border ${
            activePanel === 'search'
              ? 'bg-gray-900 text-white hover:bg-gray-800 border-gray-900'
              : 'bg-white/95 hover:bg-white border-gray-200 group'
          }`}
          title="ค้นหาตำบล"
        >
          <Search className={`w-5 h-5 ${
            activePanel !== 'search' ? 'group-hover:text-gray-900' : ''
          }`} />
        </button>
      </div>

      {/* Expanded Panel - ปรับตำแหน่งให้สอดคล้องกับปุ่ม */}
      {activePanel && (
        <div className="absolute top-44 right-20 z-[900] w-80 bg-white/95 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              {activePanel === 'filter' && (
                <>
                  <Filter className="w-4 h-4" />
                  การกรองข้อมูล
                </>
              )}
              {activePanel === 'stats' && (
                <>
                  <BarChart3 className="w-4 h-4" />
                  สถิติข้อมูล
                </>
              )}
              {activePanel === 'search' && (
                <>
                  <Search className="w-4 h-4" />
                  ค้นหาตำบล
                </>
              )}
            </h3>
            <button
              onClick={() => setActivePanel(null)}
              className="text-gray-500 hover:text-gray-900 p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {/* Filter Panel */}
            {activePanel === 'filter' && (
              <div className="p-4">
                <div className="space-y-4">
                  {/* Stats Summary */}
                  <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium">แสดงผลข้อมูล</span>
                      <span className="font-bold text-gray-900">
                        {stats.filtered}/{stats.total} รายการ
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {stats.total > 0 ? ((stats.filtered / stats.total) * 100).toFixed(1) : 0}% ของข้อมูลทั้งหมด
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCategories(categories.map(c => c.id))}
                      className="flex-1 px-3 py-2 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      เลือกทั้งหมด
                    </button>
                    <button
                      onClick={() => setSelectedCategories([])}
                      className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      ล้างทั้งหมด
                    </button>
                  </div>

                  {/* Categories List */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-600" />
                      <h4 className="text-sm font-semibold text-gray-800">หมวดหมู่ข้อมูล</h4>
                    </div>
                    
                    <div className="space-y-2">
                      {categories.map((category) => {
                        const count = stats.byCategory.find(c => c.id === category.id)?.count || 0;
                        const isSelected = selectedCategories.includes(category.id);
                        const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : 0;
                        
                        return (
                          <div
                            key={category.id}
                            className={`group p-3 rounded-lg border transition-all duration-200 ${
                              isSelected 
                                ? 'bg-gray-50 border-gray-300 shadow-sm' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCategories([...selectedCategories, category.id]);
                                  } else {
                                    setSelectedCategories(
                                      selectedCategories.filter((id) => id !== category.id)
                                    );
                                  }
                                }}
                                className="rounded border-gray-300 text-gray-900 focus:ring-yellow-400 focus:ring-2"
                              />
                              <div
                                className={`w-4 h-4 rounded flex-shrink-0 shadow-sm ${getCategoryColor(category.name)}`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-800 truncate">
                                  {category.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {getCategoryDescription(category.name)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                                  {count}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {percentage}%
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                              >
                                {isSelected ? (
                                  <Eye className="w-3 h-3 text-gray-500" />
                                ) : (
                                  <EyeOff className="w-3 h-3 text-gray-500" />
                                )}
                              </button>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Panel */}
            {activePanel === 'stats' && (
              <div className="p-4">
                <div className="space-y-4">
                  {/* Overview Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-xs text-blue-600 font-medium mb-1">เอกสารทั้งหมด</div>
                      <div className="text-lg font-bold text-blue-900">{stats.total}</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-xs text-green-600 font-medium mb-1">แสดงผลอยู่</div>
                      <div className="text-lg font-bold text-green-900">{stats.filtered}</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-xs text-purple-600 font-medium mb-1">การดูทั้งหมด</div>
                      <div className="text-lg font-bold text-purple-900">{stats.totalViews.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-xs text-orange-600 font-medium mb-1">ดาวน์โหลด</div>
                      <div className="text-lg font-bold text-orange-900">{stats.totalDownloads.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Most Popular Category */}
                  <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-800">หมวดหมู่ยอดนิยม</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{stats.mostPopularCategory.name}</span>
                      <span className="text-gray-500 ml-2">({stats.mostPopularCategory.count} เอกสาร)</span>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-600" />
                      <h4 className="text-sm font-semibold text-gray-800">การแจกแจงตามหมวดหมู่</h4>
                    </div>
                    
                    <div className="space-y-2">
                      {stats.byCategory.map((category) => {
                        const percentage = stats.total > 0 ? (category.count / stats.total) * 100 : 0;
                        
                        return (
                          <div key={category.id} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-700 truncate">{category.name}</span>
                              <span className="text-gray-500 font-medium">{category.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getCategoryColor(category.name)}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-400 text-right">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">อัตราการมีส่วนร่วม</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">การดูเฉลี่ยต่อเอกสาร</span>
                        <span className="font-medium">
                          {stats.total > 0 ? (stats.totalViews / stats.total).toFixed(1) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">ดาวน์โหลดเฉลี่ยต่อเอกสาร</span>
                        <span className="font-medium">
                          {stats.total > 0 ? (stats.totalDownloads / stats.total).toFixed(1) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">อัตราการดาวน์โหลด</span>
                        <span className="font-medium">
                          {stats.totalViews > 0 ? ((stats.totalDownloads / stats.totalViews) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search Panel */}
            {activePanel === 'search' && (
              <div className="p-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-gray-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">ค้นหาตำแหน่งตำบล</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      ค้นหาและปักหมุดตำแหน่งตำบลที่ต้องการบนแผนที่อย่างรวดเร็ว
                    </p>
                    <button
                      onClick={() => {
                        onSearchClick();
                        setActivePanel(null);
                      }}
                      className="w-full p-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm"
                    >
                      เปิดหน้าต่างค้นหา
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      วิธีการใช้งาน
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                        <div>
                          <div className="text-sm font-medium text-gray-800">พิมพ์ชื่อสถานที่</div>
                          <div className="text-xs text-gray-600">ตำบล อำเภอ หรือจังหวัด</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                        <div>
                          <div className="text-sm font-medium text-gray-800">เลือกจากรายการ</div>
                          <div className="text-xs text-gray-600">คลิกเลือกตำแหน่งที่ต้องการ</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                        <div>
                          <div className="text-sm font-medium text-gray-800">ไปยังตำแหน่ง</div>
                          <div className="text-xs text-gray-600">แผนที่จะเลื่อนไปยังตำแหน่งนั้น</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <div className="text-xs font-medium text-yellow-800 mb-1">
                      <span className="mr-1">💡</span>
                      เคล็ดลับ
                    </div>
                    <div className="text-xs text-yellow-700">
                      ใช้คำค้นหาที่สั้นและชัดเจน เช่น &quot;บางแค&quot; หรือ &quot;เขตห้วยขวาง&quot; เพื่อผลลัพธ์ที่แม่นยำ
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}