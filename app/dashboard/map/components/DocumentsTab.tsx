// components/DocumentsTab.tsx
import { DocumentWithCategory } from '@/app/types/document'
import { CategoryDoc } from '@prisma/client'
import { getCategoryColor } from '@/app/utils/colorGenerator'
import Link from 'next/link'
import { FiInfo, FiEye, FiDownload, FiCalendar, FiMapPin } from 'react-icons/fi'

interface DocumentsTabProps {
  documents: DocumentWithCategory[]
  categories: CategoryDoc[]
  setHighlightedDocId: (id: number | null) => void
  toggleAllCategories: () => void
}

export default function DocumentsTab({
  documents,
  categories,
  setHighlightedDocId,
  toggleAllCategories
}: DocumentsTabProps) {
  // ลบส่วน state searchQuery และฟังก์ชันกรองเอกสาร
  // ใช้เอกสาร 10 รายการแรกโดยตรง
  const recentDocuments = documents.slice(0, 10)
  
  return (
    <div className="p-4">
      {/* รายการเอกสาร */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {recentDocuments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentDocuments.map((doc) => {
              const cat = categories.find(c => c.id === doc.categoryId);
              const colorScheme = cat ? getCategoryColor(cat.id) : { primary: "#888888" };
              const date = new Date(doc.createdAt);

              return (
                <div
                  key={doc.id}
                  className="flex items-start p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  onMouseEnter={() => setHighlightedDocId(doc.id)}
                  onMouseLeave={() => setHighlightedDocId(null)}
                >
                  {/* จุดสีหมวดหมู่ */}
                  <div className="pt-0.5">
                    <span
                      className="block w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colorScheme.primary }}
                    ></span>
                  </div>
                  
                  {/* ข้อมูลเอกสาร */}
                  <div className="flex-1 min-w-0 ml-3">
                    <h3 className="text-sm font-medium text-slate-800">
                      {doc.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
                      <span className="text-slate-500 flex items-center">
                        <FiMapPin className="mr-1 text-orange-500" />
                        {doc.province}
                      </span>
                      <span className="text-slate-500 flex items-center">
                        <FiCalendar className="mr-1 text-orange-500" />
                        {date.toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                      {cat && (
                        <span 
                          className="px-1.5 py-0.5 rounded text-white text-xs"
                          style={{ backgroundColor: colorScheme.primary }}
                        >
                          {cat.name}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* ปุ่มดูและดาวน์โหลด */}
                  <div className="flex items-center gap-1 ml-2">
                    <Link
                      href={doc.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      onClick={(e) => e.stopPropagation()}
                      title="ดูเอกสาร"
                    >
                      <FiEye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`${doc.filePath}?download=true`}
                      download
                      className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      onClick={(e) => e.stopPropagation()}
                      title="ดาวน์โหลด"
                    >
                      <FiDownload className="w-4 h-4" />
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
      
      {/* คำแนะนำด้านล่าง */}
      {recentDocuments.length > 0 && (
        <div className="mt-3 text-xs text-slate-500 flex items-center gap-1 justify-center">
          <FiInfo className="text-orange-400" /> 
          คลิกที่เอกสารเพื่อค้นหาบนแผนที่ หรือคลิกที่ไอคอน <FiEye className="inline text-blue-500" /> เพื่อดูเอกสาร
        </div>
      )}
    </div>
  )
}