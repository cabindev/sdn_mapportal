// app/dashboard/documents/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDocumentById } from '@/app/lib/actions/documents/get';
import { getCategoryColor } from '@/app/utils/colorGenerator';
import { ArrowLeftIcon, PencilIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';


interface DocumentDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DocumentDetailsPage({ params }: DocumentDetailsPageProps) {
  // รอรับค่า params ตามข้อกำหนดของ Next.js 15
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  
  if (isNaN(id)) {
    return notFound();
  }
  
  const document = await getDocumentById(id);
  
  if (!document) {
    return notFound();
  }
  
  const colorScheme = getCategoryColor(document.categoryId);
  
  // คำนวณอายุเอกสาร
  const calculateDocumentAge = (documentYear: number | null): string => {
    if (!documentYear) return "";
    
    const currentYear = new Date().getFullYear() + 543; // แปลงเป็นปี พ.ศ.
    const yearDiff = currentYear - documentYear;
    
    if (yearDiff === 0) {
      return "ปีปัจจุบัน";
    } else if (yearDiff === 1) {
      return "1 ปีที่แล้ว";
    } else {
      return `${yearDiff} ปีที่แล้ว`;
    }
  };
  
  const documentAge = document.year ? calculateDocumentAge(document.year) : "";
  
  // รูปแบบวันที่ (พ.ศ.)
  const formattedDate = new Date(document.createdAt).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ปุ่มย้อนกลับ */}
      <div className="mb-6">
        <Link 
          href="/dashboard/documents" 
          className="inline-flex items-center text-gray-600 hover:text-orange-600"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          กลับไปยังรายการเอกสาร
        </Link>
      </div>
      
      {/* การ์ดแสดงรายละเอียดเอกสาร */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* ส่วนหัว - ปรับให้เป็นอัตราส่วน 16:9 */}
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          {document.coverImage ? (
            <div className="absolute inset-0">
              <img 
                src={document.coverImage} 
                alt={document.title} 
                className="w-full h-full object-cover" 
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: `${colorScheme.primary}10` }}>
              <div 
                className="w-[100px] h-[100px] rounded-full flex flex-col items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: colorScheme.primary }}
              >
                <div className="text-xl font-bold">เอกสาร</div>
                <div className="text-xs">{document.category?.name?.substring(0, 3) || ''}</div>
              </div>
            </div>
          )}
          
          <div 
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-medium shadow-md"
            style={{ backgroundColor: colorScheme.primary }}
          >
            {document.category?.name || 'ไม่ระบุหมวดหมู่'}
          </div>
          
          {!document.isPublished && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white rounded-full text-sm">
              ไม่เผยแพร่
            </div>
          )}
        </div>
        
        {/* ส่วนเนื้อหา */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-800">{document.title}</h1>
            <Link 
              href={`/dashboard/documents/${id}/edit`} 
              className="inline-flex items-center px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              แก้ไข
            </Link>
          </div>
          
          <div className="text-sm text-gray-500 mb-6">
            เพิ่มเมื่อ {formattedDate}
            {document.year && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                เอกสารออกเมื่อ ปี พ.ศ. {document.year} 
                <span className="ml-1 text-gray-500">({documentAge})</span>
              </span>
            )}
          </div>
          
          {document.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">รายละเอียด</h2>
              <p className="text-gray-600 whitespace-pre-line">{document.description}</p>
            </div>
          )}
          
          <div className="rounded-lg p-4 mb-6" style={{ 
            backgroundColor: `${colorScheme.primary}10`,
            borderLeft: `4px solid ${colorScheme.primary}` 
          }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: colorScheme.primary }}>
              ตำแหน่งที่ตั้ง
            </h2>
            <div className="text-gray-600">
              {document.district}, {document.amphoe}, {document.province}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              พิกัด: {document.latitude.toFixed(6)}, {document.longitude.toFixed(6)}
            </div>
          </div>
          
          <div className="flex text-sm text-gray-500 mb-6">
            <div className="flex items-center mr-6">
              <EyeIcon className="w-4 h-4 mr-1.5" />
              จำนวนการดู: {document.viewCount}
            </div>
            <div className="flex items-center">
              <ArrowDownTrayIcon className="w-4 h-4 mr-1.5" />
              ดาวน์โหลด: {document.downloadCount}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

// ทำให้เว็บไซต์โหลดข้อมูลใหม่เสมอ ไม่ใช้ cache
export const dynamic = "force-dynamic";