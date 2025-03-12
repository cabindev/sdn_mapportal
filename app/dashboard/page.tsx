// app/dashboard/page.tsx
import prisma from '../lib/db';
import { DocumentIcon, MapIcon, UserIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { getDocuments } from '@/app/lib/actions/documents/get';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { getProvinceHealthZone, getThaiZoneName } from '@/app/utils/healthZones';

async function getStats() {
  try {
    const [totalDocuments, categories, documentsPerCategory, totalUsers, provinces, documents] = await Promise.all([
      prisma.document.count(),
      prisma.categoryDoc.findMany(),
      prisma.document.groupBy({ by: ['categoryId'], _count: true }),
      prisma.user.count(),
      prisma.document.groupBy({ by: ['province'], _count: true }),
      prisma.document.findMany({
        select: {
          id: true,
          province: true,
        }
      })
    ]);
    
    const categoriesWithCount = categories.map(category => ({
      ...category,
      count: documentsPerCategory.find(doc => doc.categoryId === category.id)?._count || 0
    }));

    // คำนวณจำนวนเอกสารตามโซนสุขภาพ
    const healthZoneCounts = {
      'north-upper': 0,
      'north-lower': 0,
      'northeast-upper': 0,
      'northeast-lower': 0,
      'central': 0,
      'east': 0,
      'west': 0,
      'south-upper': 0,
      'south-lower': 0,
      'bangkok': 0
    };

    documents.forEach(doc => {
      if (doc.province) {
        const zone = getProvinceHealthZone(doc.province);
        healthZoneCounts[zone]++;
      }
    });

    // แปลงเป็นรูปแบบอาร์เรย์พร้อมชื่อโซนและสี
    const healthZonesData = [
      { code: 'north-upper', name: 'เหนือบน', count: healthZoneCounts['north-upper'], color: '#FFD400' },
      { code: 'north-lower', name: 'เหนือล่าง', count: healthZoneCounts['north-lower'], color: '#FF7733' },
      { code: 'northeast-upper', name: 'อีสานบน', count: healthZoneCounts['northeast-upper'], color: '#FF1654' },
      { code: 'northeast-lower', name: 'อีสานล่าง', count: healthZoneCounts['northeast-lower'], color: '#D90368' },
      { code: 'central', name: 'กลาง', count: healthZoneCounts['central'], color: '#65B891' },
      { code: 'east', name: 'ตะวันออก', count: healthZoneCounts['east'], color: '#247BA0' },
      { code: 'west', name: 'ตะวันตก', count: healthZoneCounts['west'], color: '#05D9E8' },
      { code: 'south-upper', name: 'ใต้บน', count: healthZoneCounts['south-upper'], color: '#99E1D9' },
      { code: 'south-lower', name: 'ใต้ล่าง', count: healthZoneCounts['south-lower'], color: '#008148' },
      { code: 'bangkok', name: 'กรุงเทพฯ', count: healthZoneCounts['bangkok'], color: '#202020' }
    ];

    return { 
      totalDocuments, 
      categoriesWithCount,
      totalUsers,
      provinces: provinces.length,
      healthZonesData
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { 
      totalDocuments: 0, 
      categoriesWithCount: [],
      totalUsers: 0,
      provinces: 0,
      healthZonesData: []
    };
  }
}

export default async function DashboardHome() {
  const stats = await getStats();
  const recentDocuments = await getDocuments();
  
  // เลือกเฉพาะ 5 เอกสารล่าสุด
  const latestDocuments = recentDocuments.slice(0, 5);
  
  // หาจำนวนสูงสุดใน healthZonesData เพื่อใช้คำนวณเปอร์เซ็นต์ความยาวของแถบ
  const maxZoneCount = Math.max(...stats.healthZonesData.map(zone => zone.count), 1);

  return (
    <div className="p-6 space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-medium text-gray-800">แผงควบคุม</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard/documents/new"
            className="text-sm px-3 py-1.5 bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 transition-colors"
          >
            + เอกสารใหม่
          </Link>
          <Link
            href="/dashboard/map"
            className="text-sm px-3 py-1.5 bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 transition-colors"
          >
            ดูแผนที่
          </Link>
        </div>
      </div>
      
      {/* สถิติย่อ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-md">
              <DocumentIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-500">เอกสารทั้งหมด</p>
              <p className="text-lg font-semibold">{stats.totalDocuments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-md">
              <MapIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-500">จังหวัดที่มีข้อมูล</p>
              <p className="text-lg font-semibold">{stats.provinces}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-md">
              <UserIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-500">ผู้ใช้งาน</p>
              <p className="text-lg font-semibold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* หมวดหมู่ */}
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-medium text-gray-700 mb-3">หมวดหมู่เอกสาร</h2>
          {stats.categoriesWithCount.length > 0 ? (
            <div className="space-y-2">
              {stats.categoriesWithCount.map((cat) => (
                <div key={cat.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{cat.name}</span>
                  <div className="flex items-center">
                    <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden mr-2">
                      <div 
                        className="h-full bg-orange-500 rounded-full"
                        style={{ 
                          width: `${Math.min(100, (cat.count / Math.max(...stats.categoriesWithCount.map(c => c.count), 1)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-gray-700 font-medium">{cat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีข้อมูลหมวดหมู่</p>
          )}
        </div>
        
        {/* กิจกรรมล่าสุด */}
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-medium text-gray-700 mb-3">กิจกรรมล่าสุด</h2>
          {latestDocuments.length > 0 ? (
            <div className="space-y-3">
              {latestDocuments.map((doc) => (
                <Link href={`/dashboard/documents/${doc.id}`} key={doc.id}>
                  <div className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded-md transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                      {doc.coverImage ? (
                        <Image 
                          src={doc.coverImage.startsWith('/') ? doc.coverImage : `/${doc.coverImage}`} 
                          alt={doc.title}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <DocumentIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{doc.title}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(doc.createdAt), { 
                            addSuffix: true,
                            locale: th 
                          })}
                        </span>
                        <span className="mx-1 text-gray-300">•</span>
                        <span className="text-xs px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded">
                          {doc.category?.name || 'ไม่ระบุหมวดหมู่'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500 text-center py-4 bg-gray-50 rounded-md">
              ยังไม่มีกิจกรรมล่าสุด
            </div>
          )}
          
          <div className="mt-3 text-center">
            <Link 
              href="/dashboard/documents" 
              className="text-xs text-orange-600 hover:text-orange-700"
            >
              ดูเอกสารทั้งหมด →
            </Link>
          </div>
        </div>
      </div>
      
      {/* การกระจายตามโซนสุขภาพ */}
      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center mb-3">
          <ChartBarIcon className="w-4 h-4 text-orange-500 mr-1.5" />
          <h2 className="text-sm font-medium text-gray-700">การกระจายตามโซนสุขภาพ</h2>
        </div>
        
        {stats.healthZonesData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {stats.healthZonesData.map((zone) => (
              <div key={zone.code} className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: zone.color }}
                  ></span>
                  <span className="text-gray-600">{zone.name}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden mr-2">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${Math.min(100, (zone.count / maxZoneCount) * 100)}%`,
                        backgroundColor: zone.color
                      }}
                    ></div>
                  </div>
                  <span className="text-gray-700 font-medium w-6 text-right">{zone.count}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีข้อมูลการกระจายตามโซน</p>
        )}
        
        <div className="mt-3 text-center">
          <Link 
            href="/dashboard/map" 
            className="text-xs text-orange-600 hover:text-orange-700"
          >
            ดูแผนที่เต็มรูปแบบ →
          </Link>
        </div>
      </div>
      
      {/* การดำเนินการด่วน */}
      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center mb-3">
          <BoltIcon className="w-4 h-4 text-orange-500 mr-1.5" />
          <h2 className="text-sm font-medium text-gray-700">การดำเนินการด่วน</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Link
            href="/dashboard/documents/new"
            className="text-xs px-3 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-center"
          >
            เพิ่มเอกสาร
          </Link>
          <Link
            href="/dashboard/categories/new"
            className="text-xs px-3 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-center"
          >
            เพิ่มหมวดหมู่
          </Link>
          <Link
            href="/dashboard/map"
            className="text-xs px-3 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-center"
          >
            ดูแผนที่
          </Link>
          <Link
            href="/dashboard/settings/users"
            className="text-xs px-3 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-center"
          >
            จัดการผู้ใช้
          </Link>
        </div>
      </div>
    </div>
  );
}