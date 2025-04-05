// app/dashboard/provinces/[province]/page.tsx
import { 
  getDocumentsByProvince, 
  getCategoryStatsByProvince 
} from '@/app/lib/actions/statistics/provinces'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  MapPinIcon, 
  DocumentTextIcon, 
  FolderIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'
import DocumentsTable from '../components/DocumentsTable'
import { getProvinceHealthZone, getThaiZoneName } from '@/app/utils/healthZones'

// แก้ไขการนำเข้า type ให้ถูกต้อง
import type { Document, CategoryStat } from '@/app/dashboard/components/types/province'

export default async function ProvinceDetailPage({
  params
}: {
  params: Promise<{ province: string }>
}) {
  // ดึงค่า params แบบ async
  const resolvedParams = await params;
  
  // ใช้ค่า province จาก params ที่ resolve แล้ว
  const provinceName = decodeURIComponent(resolvedParams.province);
  
  // ดึงข้อมูลเอกสารและสถิติของจังหวัด
  const documents = await getDocumentsByProvince(provinceName);
  const categoryStats = await getCategoryStatsByProvince(provinceName);
  
  // จำนวนเอกสารที่เผยแพร่
  const publishedDocuments = documents.filter(doc => doc.isPublished).length;
  
  // ดึงข้อมูลภูมิภาค
  const healthZone = getProvinceHealthZone(provinceName);
  const zoneName = getThaiZoneName(healthZone);
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ส่วนหัว */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div className="flex items-center">
          <Link 
            href="/dashboard/provinces" 
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            กลับ
          </Link>
          
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <MapPinIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">จังหวัด{provinceName}</h1>
              <div className="text-sm text-gray-500">ภูมิภาค: {zoneName}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* สรุปข้อมูลสถิติ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        {/* จำนวนเอกสารทั้งหมด */}
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-gray-600 text-sm mb-1">เอกสารทั้งหมด</h2>
          <div className="flex items-center">
            <DocumentTextIcon className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
            <p className="text-2xl md:text-3xl font-bold ml-3 text-gray-800">{documents.length}</p>
          </div>
        </div>
        
        {/* จำนวนเอกสารที่เผยแพร่ */}
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-gray-600 text-sm mb-1">เอกสารที่เผยแพร่</h2>
          <div className="flex items-center">
            <DocumentTextIcon className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
            <p className="text-2xl md:text-3xl font-bold ml-3 text-gray-800">{publishedDocuments}</p>
          </div>
        </div>
        
        {/* จำนวนหมวดหมู่ */}
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-gray-600 text-sm mb-1">จำนวนประเภทงาน</h2>
          <div className="flex items-center">
            <FolderIcon className="w-8 h-8 md:w-10 md:h-10 text-orange-600" />
            <p className="text-2xl md:text-3xl font-bold ml-3 text-gray-800">{categoryStats.length}</p>
          </div>
        </div>
      </div>
      
      {/* ตารางและการ์ดแสดงหมวดหมู่ */}
      {categoryStats.length > 0 && (
        <div className="mb-8 md:mb-10">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">ประเภทงานในจังหวัด {provinceName}</h2>
          
          {/* การแสดงผลบนมือถือ (แบบการ์ด) */}
          <div className="md:hidden">
            <div className="grid grid-cols-1 gap-3">
              {categoryStats.map((category) => (
                <div 
                  key={category.id} 
                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <div className="bg-orange-100 p-2 rounded-lg mr-3">
                      <FolderIcon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold flex items-center">
                    <DocumentIcon className="w-4 h-4 mr-1" />
                    {category.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* การแสดงผลบนหน้าจอใหญ่ (แบบตาราง) */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่องาน
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จำนวนเอกสาร
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryStats.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FolderIcon className="w-5 h-5 text-orange-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {category.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* ตารางแสดงเอกสาร */}
      <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
        รายการเอกสารในจังหวัด {provinceName} ({documents.length})
      </h2>
      {documents && documents.length > 0 ? (
        <DocumentsTable
          documents={documents} 
          provinceName={provinceName} 
        />
      ) : (
        <div className="text-center p-8 md:p-10 bg-gray-50 rounded-lg">
          <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">ไม่พบเอกสารในจังหวัดนี้</p>
        </div>
      )}
    </div>
  )
}

// กำหนดให้โหลดข้อมูลใหม่เสมอ
export const dynamic = "force-dynamic"