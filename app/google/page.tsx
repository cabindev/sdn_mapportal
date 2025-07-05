// app/google/page.tsx
import { getCategories } from '@/app/lib/actions/categories/get'
import { getPublishedDocuments } from '@/app/lib/actions/documents/get'
import Link from 'next/link'
import { FiArrowLeft, FiMap, FiFilter, FiInfo } from 'react-icons/fi'
import { getCategoryColor } from '@/app/utils/colorGenerator'
import GoogleMapClient from './components/GoogleMapClient'

export default async function GoogleMapsPage() {
  // ดึงข้อมูลเอกสารและหมวดหมู่
  const [categories, documents] = await Promise.all([
    getCategories(),
    getPublishedDocuments()
  ])


  // จัดกลุ่มเอกสารตามจังหวัด
  const provinceGroups = documents.reduce((acc, doc) => {
    if (!acc[doc.province]) {
      acc[doc.province] = { count: 0, documents: [] };
    }
    acc[doc.province].count += 1;
    acc[doc.province].documents.push(doc);
    return acc;
  }, {} as Record<string, { count: number, documents: any[] }>);

  // เรียงลำดับจังหวัดตามจำนวนเอกสาร
  const topProvinces = Object.entries(provinceGroups)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-orange-600 text-white py-8">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-white/90 hover:text-white mb-4 transition-colors">
            <FiArrowLeft className="mr-2" /> กลับไปหน้าหลัก
          </Link>
          <h1 className="text-3xl font-bold mb-2">แผนที่เอกสารด้วย Google Maps</h1>
          <p className="text-white/80 max-w-3xl">
            แสดงตำแหน่งเอกสารทั้งหมด {documents.length} รายการบนแผนที่ Google Maps เพื่อการค้นหาและเข้าถึงข้อมูลได้อย่างสะดวกรวดเร็ว
          </p>
        </div>
      </div>

      {/* Stats Summary สถิติ*/}
      <div className="container mx-auto px-4 -mt-6 mb-8 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 border-b md:border-b-0 md:border-r border-gray-100">
            <p className="text-4xl font-bold text-orange-500 mb-1">{documents.length}</p>
            <p className="text-gray-600">เอกสารทั้งหมด</p>
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

      {/* แผนที่ Google Maps */}
      <div className="container mx-auto px-4 mb-12">
        <GoogleMapClient documents={documents} />
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

      {/* วิธีใช้งาน */}
      <div className="container mx-auto px-4 mb-16">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
              <FiInfo className="w-5 h-5" />
            </span>
            วิธีใช้งานแผนที่ Google Maps
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="text-center mb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-600 rounded-full mb-2">
                  <span className="font-bold">1</span>
                </div>
                <h3 className="font-medium text-gray-800">ค้นหาตำแหน่ง</h3>
              </div>
              <p className="text-sm text-gray-600 text-center">คลิกที่หมุดบนแผนที่เพื่อดูข้อมูลเอกสารในตำแหน่งนั้นๆ</p>
            </div>
            
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="text-center mb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-600 rounded-full mb-2">
                  <span className="font-bold">2</span>
                </div>
                <h3 className="font-medium text-gray-800">ซูมแผนที่</h3>
              </div>
              <p className="text-sm text-gray-600 text-center">ใช้ปุ่ม + และ - หรือเลื่อนเมาส์เพื่อซูมเข้าและออกจากแผนที่</p>
            </div>
            
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="text-center mb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-600 rounded-full mb-2">
                  <span className="font-bold">3</span>
                </div>
                <h3 className="font-medium text-gray-800">ดูรายละเอียด</h3>
              </div>
              <p className="text-sm text-gray-600 text-center">คลิกที่ลิงก์ในป็อปอัพเพื่อดูรายละเอียดเอกสารเพิ่มเติม</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}