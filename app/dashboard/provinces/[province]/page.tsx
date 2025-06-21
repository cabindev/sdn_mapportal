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
import type { Document, CategoryStat } from '@/app/dashboard/components/types/province'

export default async function ProvinceDetailPage({
  params
}: {
  params: Promise<{ province: string }>
}) {
  const resolvedParams = await params;
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
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <Link 
              href="/dashboard/provinces" 
              className="flex items-center text-slate-600 hover:text-slate-900 mr-6 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              <span className="font-light">กลับ</span>
            </Link>
            
            <div className="flex items-center">
              <div className="p-3 bg-slate-100 rounded-xl">
                <MapPinIcon className="w-6 h-6 text-slate-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-light text-slate-900">จังหวัด{provinceName}</h1>
                <div className="text-sm font-light text-slate-600">ภูมิภาค: {zoneName}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* เอกสารทั้งหมด */}
          <div className="bg-white rounded-xl border border-slate-200/50 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-slate-100 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-slate-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-light text-slate-600">เอกสารทั้งหมด</p>
                <p className="text-3xl font-light text-slate-900">{documents.length.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          {/* เอกสารที่เผยแพร่ */}
          <div className="bg-white rounded-xl border border-slate-200/50 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-light text-slate-600">เอกสารที่เผยแพร่</p>
                <p className="text-3xl font-light text-emerald-600">{publishedDocuments.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          {/* จำนวนหมวดหมู่ */}
          <div className="bg-white rounded-xl border border-slate-200/50 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-lg">
                <FolderIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-light text-slate-600">จำนวนประเภทงาน</p>
                <p className="text-3xl font-light text-amber-600">{categoryStats.length.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Category Statistics */}
        {categoryStats.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-light mb-6 text-slate-900">ประเภทงานในจังหวัด {provinceName}</h2>
            
            {/* Mobile View - Cards */}
            <div className="lg:hidden">
              <div className="grid grid-cols-1 gap-3">
                {categoryStats.map((category) => (
                  <div 
                    key={category.id} 
                    className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-sm flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-slate-100 rounded-lg mr-3">
                        <FolderIcon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-light text-slate-900">{category.name}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-light flex items-center">
                      <DocumentIcon className="w-4 h-4 mr-1" />
                      {category.count.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Desktop View - Table */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-200/50 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200/50">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      ชื่องาน
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                      จำนวนเอกสาร
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200/30">
                  {categoryStats.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FolderIcon className="w-5 h-5 text-slate-500 mr-3" />
                          <span className="text-sm font-light text-slate-900">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="px-3 py-1 inline-flex text-sm font-light rounded-lg bg-slate-100 text-slate-700">
                          {category.count.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Documents Table */}
        <div className="mb-8">
          <h2 className="text-xl font-light mb-6 text-slate-900">
            รายการเอกสารในจังหวัด {provinceName} ({documents.length.toLocaleString()})
          </h2>
          
          {documents && documents.length > 0 ? (
            <DocumentsTable
              documents={documents} 
              provinceName={provinceName} 
            />
          ) : (
            <div className="text-center p-12 bg-white rounded-xl border border-slate-200/50 shadow-sm">
              <DocumentIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 font-light">ไม่พบเอกสารในจังหวัดนี้</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const dynamic = "force-dynamic"