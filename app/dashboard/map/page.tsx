// app/dashboard/map/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { CategoryDoc } from '@prisma/client'
import { DocumentWithCategory } from '@/app/types/document'
import { getCategories } from '@/app/lib/actions/categories/get'
import { getDocuments } from '@/app/lib/actions/documents/get'
import dynamic from 'next/dynamic'
import { getCategoryColor } from '@/app/utils/colorGenerator'
import Link from 'next/link'
import { FiMap, FiFilter, FiInfo, FiList, FiBarChart2, FiLayers } from 'react-icons/fi'
import CircleLoader from './components/CircleLoader'
import RegionalStats from './components/RegionalStats'

// นำเข้า DynamicMapView แบบ dynamic import ไม่ต้องแสดง loading ซ้ำซ้อน
const DynamicMapView = dynamic(
  () => import('./components/DynamicMapView'),
  { 
    ssr: false, 
    loading: () => <div className="h-[60vh] w-full flex items-center justify-center bg-slate-50">
      <CircleLoader message="กำลังโหลดแผนที่..." />
    </div> 
  }
);

export default function MapPage() {
  const [categories, setCategories] = useState<CategoryDoc[]>([])
  const [documents, setDocuments] = useState<DocumentWithCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState<'categories' | 'legend' | 'stats' | 'docs'>('categories')
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [highlightedDocId, setHighlightedDocId] = useState<number | null>(null)
  const [recentDocuments, setRecentDocuments] = useState<DocumentWithCategory[]>([])

  // Check if component is mounted (for client-side only operations)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // โหลดข้อมูล
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catsData, docsData] = await Promise.all([
          getCategories(),
          getDocuments()
        ]);
        
        setCategories(catsData);
        
        // เรียงลำดับเอกสารตามวันที่ล่าสุด
        const sortedDocs = [...docsData].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        // เพิ่มคุณสมบัติ isLatest ให้กับเอกสารล่าสุด 5 รายการ
        const docsWithLatestFlag = sortedDocs.map((doc, index) => ({
          ...doc,
          isLatest: index < 5,
        }));
        
        setDocuments(docsWithLatestFlag);
        
      // เปลี่ยนจาก 5 เป็น 10 รายการ
      setRecentDocuments(sortedDocs.slice(0, 10));
        
        setSelectedCategories(catsData.map(c => c.id));
      } catch (error) {
        console.error('Error loading data:', error);
        setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // ฟังก์ชันเมื่อ hover ที่รายการเอกสาร
  const handleHoverDocument = useCallback((documentId: number | null) => {
    setHighlightedDocId(documentId);
  }, []);

  // กรองเอกสารตามหมวดหมู่ที่เลือก
  const filteredDocuments = documents.filter(doc => 
    selectedCategories.length === 0 || selectedCategories.includes(doc.categoryId)
  );

  // เรียงลำดับเอกสารให้ล่าสุดอยู่บนสุด
  const sortedDocuments = [...filteredDocuments].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // ฟังก์ชั่นสลับเลือกหมวดหมู่ทั้งหมด
  const toggleAllCategories = useCallback(() => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(c => c.id));
    }
  }, [selectedCategories, categories]);

  // ฟังก์ชั่นสลับเลือกหมวดหมู่เดียว
  const toggleCategory = useCallback((categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  // แสดง loading
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <CircleLoader message="กำลังโหลดข้อมูล..." />
      </div>
    );
  }

  // แสดงข้อผิดพลาด
  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-slate-200 max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  // แสดงหน้าปกติ
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* โครงสร้างหลัก - แผนที่ขยายเต็มพื้นที่ */}
      <div className="flex-1 overflow-hidden relative">
        {isMounted && (
          <DynamicMapView
            categories={categories}
            documents={documents.map((doc) => ({
              ...doc,
              isLatest: doc.isLatest || doc.id === highlightedDocId,
            }))}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            recentDocuments={recentDocuments}
            onHoverDocument={handleHoverDocument}
            showRecentDocuments={false}
          />
        )}
      </div>

      {/* ส่วนข้อมูลด้านล่าง - รวมทั้งส่วนหัวและแท็บข้อมูล */}
      <div className="bg-white border-t border-slate-200 flex-shrink-0 z-20 shadow-md">
        {/* ส่วนหัว */}
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
                  {documents.length} เอกสาร
                </span>
                <span className="px-2.5 py-1.5 bg-orange-50 rounded-md text-sm text-orange-600 flex items-center">
                  <FiBarChart2 className="mr-1" />
                  {filteredDocuments.length} รายการที่แสดง
                </span>
              </div>
              <button
                onClick={toggleAllCategories}
                className="text-sm px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-md transition-colors flex items-center border border-slate-200"
              >
                <FiFilter className="mr-1.5 text-orange-500" />
                {selectedCategories.length === categories.length
                  ? "ยกเลิกการเลือกทั้งหมด"
                  : "เลือกทั้งหมด"}
              </button>
            </div>
          </div>
        </div>

        {/* แท็บ navigation */}
        <div className="px-1 py-2 border-b border-slate-200">
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
              คำอธิบายสัญลักษณ์
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex-1 flex justify-center items-center py-2 px-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === "stats"
                  ? "bg-orange-50 text-orange-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <FiBarChart2 className="mr-1.5" />
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
              <FiList className="mr-1.5" />
              เอกสารล่าสุด
            </button>
          </div>
        </div>

        {/* เนื้อหาตามแท็บ - แสดงต่อจากโค้ดเดิมของคุณ */}
        <div
          className="overflow-y-auto bg-white"
          style={{ maxHeight: "250px" }}
        >
          {/* แท็บหมวดหมู่ */}
          {activeTab === "categories" && (
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {categories.map((cat) => {
                  const colorScheme = getCategoryColor(cat.id);
                  const isSelected = selectedCategories.includes(cat.id);
                  const count = documents.filter(
                    (d) => d.categoryId === cat.id
                  ).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`py-2 px-3 text-sm rounded transition-all duration-200 flex flex-col ${
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
                  );
                })}
              </div>
            </div>
          )}

          {/* แท็บคำอธิบายสัญลักษณ์ */}
          {activeTab === "legend" && (
            <div className="p-4">
              <h2 className="font-medium text-slate-800 mb-3">
                คำอธิบายสัญลักษณ์
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => {
                  const colorScheme = getCategoryColor(category.id);
                  return (
                    <div
                      key={category.id}
                      className="flex items-center p-2 bg-white rounded-md shadow-sm border border-slate-200"
                    >
                      <span
                        className="w-5 h-5 rounded-full mr-2 flex-shrink-0 border-2 border-white shadow-sm"
                        style={{ backgroundColor: colorScheme.primary }}
                      ></span>
                      <span className="text-sm text-slate-700">
                        {category.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <h2 className="font-medium text-slate-800 mt-5 mb-3">
                วิธีใช้งานแผนที่
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start bg-white p-2 rounded-md shadow-sm border border-slate-200">
                  <div className="bg-orange-50 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center font-medium mr-2 flex-shrink-0">
                    1
                  </div>
                  <div>คลิกที่แผนที่เพื่อเพิ่มเอกสารใหม่</div>
                </div>
                <div className="flex items-start bg-white p-2 rounded-md shadow-sm border border-slate-200">
                  <div className="bg-orange-50 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center font-medium mr-2 flex-shrink-0">
                    2
                  </div>
                  <div>คลิกที่จุดบนแผนที่เพื่อดูรายละเอียดเอกสาร</div>
                </div>
                <div className="flex items-start bg-white p-2 rounded-md shadow-sm border border-slate-200">
                  <div className="bg-orange-50 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center font-medium mr-2 flex-shrink-0">
                    3
                  </div>
                  <div>ค้นหาตำแหน่งด้วยช่องค้นหาด้านบน</div>
                </div>
              </div>
            </div>
          )}

          {/* แท็บสถิติ */}
          {activeTab === "stats" && (
            <div className="p-4">
              <div className="flex flex-wrap">
                {/* สถิติสัดส่วนตามหมวดหมู่ */}
                <div className="w-full md:w-2/3 pr-0 md:pr-4">
                  <h2 className="font-medium text-slate-800 mb-3">
                    สถิติเอกสารตามหมวดหมู่
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
                        <div key={cat.id}>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center">
                              <span
                                className="w-3 h-3 rounded-full mr-1.5"
                                style={{ backgroundColor: colorScheme.primary }}
                              ></span>
                              <span className="text-sm text-slate-700 truncate">
                                {cat.name}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {count}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-full bg-slate-100 rounded-full h-2 mr-2">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: colorScheme.primary,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-500 w-8 text-right">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* สถิติตามภูมิภาค - ใช้คอมโพเนนต์ใหม่ */}
                <div className="w-full md:w-1/3 mt-4 md:mt-0">
                  <RegionalStats documents={documents} />
                </div>
              </div>
            </div>
          )}

          {/* แท็บเอกสารล่าสุด */}
          {activeTab === "docs" && (
            <div className="p-4">
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                {sortedDocuments.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {sortedDocuments.slice(0, 10).map((doc) => {
                      const cat = categories.find(
                        (c) => c.id === doc.categoryId
                      );
                      const colorScheme = cat
                        ? getCategoryColor(cat.id)
                        : { primary: "#888888" };

                      return (
                        <div
                          key={doc.id}
                          className="flex items-center px-3 py-2 hover:bg-slate-50 transition-colors"
                          onMouseEnter={() => setHighlightedDocId(doc.id)}
                          onMouseLeave={() => setHighlightedDocId(null)}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full mr-3 flex-shrink-0"
                            style={{ backgroundColor: colorScheme.primary }}
                          ></div>

                          <div className="flex-1 min-w-0 mr-3">
                            <h3 className="text-sm font-medium text-slate-800 truncate">
                              {doc.title}
                            </h3>
                            <div className="flex items-center text-xs text-slate-500 mt-0.5">
                              <span className="truncate">{doc.province}</span>
                              <span className="mx-1.5">•</span>
                              <span>
                                {new Date(doc.createdAt).toLocaleDateString(
                                  "th-TH",
                                  {
                                    day: "numeric",
                                    month: "short",
                                  }
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <Link
                              href={doc.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-500 hover:text-blue-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                              title="ดูเอกสาร"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </Link>
                            <Link
                              href={`${doc.filePath}?download=true`}
                              download
                              className="p-1.5 text-slate-500 hover:text-green-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                              title="ดาวน์โหลด"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    <div className="mb-2">
                      <FiInfo className="h-8 w-8 mx-auto text-slate-300" />
                    </div>
                    <p>ไม่พบเอกสารที่ตรงกับการกรองข้อมูล</p>
                    <button
                      onClick={toggleAllCategories}
                      className="mt-2 px-3 py-1 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-md text-xs transition-colors"
                    >
                      แสดงทั้งหมด
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}