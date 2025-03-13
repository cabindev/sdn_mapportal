// app/page.tsx
import { getCategories } from '@/app/lib/actions/categories/get'
import { getPublishedDocuments } from '@/app/lib/actions/documents/get'
import Link from 'next/link'
import { getCategoryColor } from '@/app/utils/colorGenerator'
import { FiMap, FiFileText, FiFilter, FiInfo, FiChevronRight } from 'react-icons/fi'
import MapFilterWrapper from './components/MapFilterWrapper'

export default async function HomePage() {
  const [categories, documents] = await Promise.all([
    getCategories(),
    getPublishedDocuments()
  ])

  // Group documents by province
  const provinceGroups = documents.reduce((acc, doc) => {
    if (!acc[doc.province]) {
      acc[doc.province] = { count: 0, documents: [] };
    }
    acc[doc.province].count += 1;
    acc[doc.province].documents.push(doc);
    return acc;
  }, {} as Record<string, { count: number, documents: any[] }>);

  // Sort provinces by document count
  const topProvinces = Object.entries(provinceGroups)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5);

  return (
    <main className="min-h-screen pt-2 bg-gradient-to-br from-white to-gray-50">
      {/* Map Section with Filter - Moved to top */}
      <div className="container mx-auto px-8 mb-16 mt-0">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 relative">
          <MapFilterWrapper 
            categories={categories} 
            documents={documents}
          />
        </div>
      </div>

      {/* Hero Section - Moved below map */}
      <div className="relative bg-gradient-to-r from-orange-600 to-orange-400 text-white pt-16 pb-32 px-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="w-full h-full bg-[url('/images/map-pattern.png')] bg-repeat bg-center"></div>
        </div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">ระบบแผนที่เอกสาร SDN</h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              เข้าถึงเอกสารสำคัญได้อย่างง่ายดาย ด้วยการนำเสนอในรูปแบบแผนที่ที่เข้าใจง่าย
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/dashboard/map" 
                className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-lg font-medium hover:bg-gray-100 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FiMap className="w-5 h-5" />
                <span>จัดการเอกสาร</span>
              </Link>
              <Link 
                href="/dashboard/documents" 
                className="flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition"
              >
                <FiFileText className="w-5 h-5" />
                <span>ดูเอกสารทั้งหมด</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="container mx-auto px-4 -mt-16 mb-12 relative z-20">
        <div className="bg-white rounded-xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-800">
          <div className="text-center p-4 border-b md:border-b-0 md:border-r border-gray-100">
            <p className="text-4xl font-bold text-orange-500 mb-1">{documents.length}</p>
            <p className="text-gray-600">เอกสารที่เผยแพร่</p>
          </div>
          <div className="text-center p-4 border-b md:border-b-0 md:border-r border-gray-100">
            <p className="text-4xl font-bold text-orange-500 mb-1">{categories.length}</p>
            <p className="text-gray-600">ประเภทเอกสาร</p>
          </div>
          <div className="text-center p-4">
            <p className="text-4xl font-bold text-orange-500 mb-1">{Object.keys(provinceGroups).length}</p>
            <p className="text-gray-600">จังหวัดที่มีข้อมูล</p>
          </div>
        </div>
      </div>
      
      {/* Document Types and Popular Areas */}
      <div className="container mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Document Types */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                <FiFilter className="w-5 h-5" />
              </span>
              ประเภทเอกสาร
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map(category => {
                const color = getCategoryColor(category.id).primary;
                const count = documents.filter(d => d.categoryId === category.id).length;
                return (
                  <div key={category.id} className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2 group-hover:scale-125 transition-transform"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-gray-700">{category.name}</span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {count} รายการ
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Popular Areas */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                <FiMap className="w-5 h-5" />
              </span>
              พื้นที่ยอดนิยม
            </h2>
            <div className="space-y-4">
              {topProvinces.map(([province, data], index) => (
                <div key={province} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-medium mr-2">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{province}</span>
                  </div>
                  <span className="px-3 py-1.5 bg-orange-50 text-orange-600 text-xs rounded-full">
                    {data.count} เอกสาร
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Usage Guide */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">คำแนะนำการใช้งาน</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">เรียนรู้วิธีการใช้งานแผนที่เอกสารให้เกิดประโยชน์สูงสุด</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                <FiMap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">สำรวจพื้นที่</h3>
              <p className="text-gray-600">ซูมเข้า-ออกเพื่อดูตำแหน่งเอกสารในแต่ละพื้นที่ทั่วประเทศ</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">ดูรายละเอียด</h3>
              <p className="text-gray-600">คลิกที่หมุดบนแผนที่เพื่อดูรายละเอียดเอกสารและเปิดดูไฟล์</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                <FiFilter className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">กรองเอกสาร</h3>
              <p className="text-gray-600">ใช้ตัวกรองด้านบนขวาของแผนที่เพื่อเลือกดูเฉพาะประเภทที่ต้องการ</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                <FiInfo className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">ข้อมูลล่าสุด</h3>
              <p className="text-gray-600">หมุดที่มีเอฟเฟกต์เคลื่อนไหวแสดงเอกสารล่าสุดที่เพิ่งอัปเดต</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-400 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">พร้อมเริ่มใช้งาน?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            เริ่มใช้งานระบบแผนที่เอกสารวันนี้ เพื่อการจัดการข้อมูลอย่างมีประสิทธิภาพ
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/dashboard/map" 
              className="px-8 py-4 bg-white text-orange-600 rounded-lg font-medium text-lg hover:bg-gray-100 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              ไปที่แดชบอร์ด
            </Link>
            <Link 
              href="/dashboard/documents" 
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-medium text-lg hover:bg-white/10 transition"
            >
              ดูเอกสารทั้งหมด
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}