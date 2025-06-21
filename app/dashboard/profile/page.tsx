// app/dashboard/profile/page.tsx
'use client'

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserIcon, DocumentTextIcon, ShieldCheckIcon, CalendarIcon, ArrowRightIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import CircleLoader from "../map/components/CircleLoader";

// เพิ่ม action สำหรับดึงข้อมูลเอกสารของผู้ใช้
import { getUserDocuments } from "@/app/lib/actions/user/get-documents";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    documents: 0,
    published: 0,
    drafts: 0,
    views: 0,
    downloads: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (session?.user?.id) {
        try {
          // ดึงข้อมูลผู้ใช้
          const userRes = await fetch(`/api/auth/signup/${session.user.id}`);
          if (!userRes.ok) {
            const errorText = await userRes.text();
            console.error('API Error:', userRes.status, errorText);
            throw new Error(`API error: ${userRes.status}`);
          }
          const userData = await userRes.json();
          setUser(userData);

          // ดึงข้อมูลเอกสารของผู้ใช้
          const documents = await getUserDocuments(Number(session.user.id));

          // คำนวณสถิติจากข้อมูลเอกสาร
          const publishedDocs = documents.filter(doc => doc.isPublished);
          const draftDocs = documents.filter(doc => !doc.isPublished);
          const totalViews = documents.reduce((sum, doc) => sum + doc.viewCount, 0);
          const totalDownloads = documents.reduce((sum, doc) => sum + doc.downloadCount, 0);

          setStats({
            documents: documents.length,
            published: publishedDocs.length,
            drafts: draftDocs.length,
            views: totalViews,
            downloads: totalDownloads
          });

          setLoading(false);
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("ไม่สามารถดึงข้อมูลได้ โปรดลองใหม่อีกครั้ง");
          setLoading(false);
        }
      }
    }

    fetchData();
  }, [session]);

  if (loading) {
    return <CircleLoader />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="max-w-5xl mx-auto p-2">
      <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white p-3 rounded-t-lg shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">โปรไฟล์ของฉัน</h1>
        <p className="mt-1 text-gray-200 text-sm">
          ยินดีต้อนรับ, <span className="font-medium">{user?.firstName || "ผู้ใช้"}</span>! ศูนย์กลางจัดการเอกสารของคุณ
        </p>
      </div>

      <div className="bg-white rounded-b-lg shadow-sm border border-gray-100 overflow-hidden">
        {/* โปรไฟล์การ์ด */}
        <div className="relative">
          {/* พื้นหลังแบบโค้ง */}
          <div className="absolute h-24 inset-x-0 top-0 bg-gradient-to-b from-gray-50 via-gray-25 to-transparent rounded-b-[50%] opacity-70"></div>
          
          <div className="relative px-3 pt-12 pb-6">
            <div className="flex flex-col items-center">
              {/* รูปโปรไฟล์ */}
              <div className="relative mb-4">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-white border-2 border-white ring-1 ring-gray-200 shadow-sm flex items-center justify-center">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={`${user?.firstName || ""} ${user?.lastName || ""}`}
                      className="h-24 w-24 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-12 w-12 text-gray-400">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                          </div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                      <UserIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                {user && user.role === "ADMIN" && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-gray-700 to-gray-800 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm border border-white">
                    แอดมิน
                  </div>
                )}
              </div>
              
              {/* ข้อมูลผู้ใช้ */}
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                {user?.firstName || ""} {user?.lastName || ""}
              </h2>
              <p className="text-gray-500 mt-1 text-sm">{user?.email || ""}</p>
              
              {/* แท็กข้อมูล */}
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  <ShieldCheckIcon className="h-3 w-3 mr-1" />
                  {user?.role === "ADMIN" ? "ผู้ดูแลระบบ" : "สมาชิก"}
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  สมาชิกตั้งแต่ {user?.createdAt ? formatDate(user.createdAt) : ""}
                </div>
              </div>

              {/* ปุ่มแก้ไขโปรไฟล์ */}
              <div className="mt-4">
                <Link
                  href="/dashboard/settings/profile"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  แก้ไขโปรไฟล์
                  <ArrowRightIcon className="ml-2 h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* สถิติแบบการ์ด */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 mx-3 bg-gray-50 rounded-lg mb-4">
          <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="text-gray-600 font-medium text-xs mb-1">เอกสารทั้งหมด</div>
            <div className="text-gray-900 text-xl font-bold">{stats.documents}</div>
            <div className="mt-2 p-1.5 bg-gray-50 rounded-full">
              <DocumentTextIcon className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="text-gray-600 font-medium text-xs mb-1">เอกสารเผยแพร่แล้ว</div>
            <div className="text-gray-900 text-xl font-bold">{stats.published}</div>
            <div className="mt-2 p-1.5 bg-gray-50 rounded-full">
              <CheckCircleIcon className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="text-gray-600 font-medium text-xs mb-1">เอกสารไม่เผยแพร่</div>
            <div className="text-gray-900 text-xl font-bold">{stats.drafts}</div>
            <div className="mt-2 p-1.5 bg-gray-50 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="text-gray-600 font-medium text-xs mb-1">จำนวนเข้าชม</div>
            <div className="text-gray-900 text-xl font-bold">{stats.views}</div>
            <div className="mt-2 p-1.5 bg-gray-50 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="text-gray-600 font-medium text-xs mb-1">ดาวน์โหลด</div>
            <div className="text-gray-900 text-xl font-bold">{stats.downloads}</div>
            <div className="mt-2 p-1.5 bg-gray-50 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>
          </div>
        </div>

        {/* ทางลัด */}
        <div className="p-4 bg-white">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">เมนูลัด</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* สร้างเอกสารใหม่ */}
            <Link href="/dashboard/documents/new" className="group block bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
              <div className="flex items-center">
                <div className="bg-gray-200 rounded-full p-2 mr-3 text-gray-700 transition-transform duration-300 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">สร้างเอกสารใหม่</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">เริ่มสร้างเอกสารใหม่เพื่อเผยแพร่แก่ผู้ใช้ทั่วไป</p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="text-xs text-gray-700 font-medium inline-flex items-center group-hover:translate-x-1 transition-transform duration-300">
                  เริ่มสร้างเอกสาร
                  <ChevronRightIcon className="ml-1 h-3 w-3" />
                </span>
              </div>
            </Link>

            {/* แก้ไขโปรไฟล์ */}
            <Link href="/dashboard/setting/profile" className="group block bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
              <div className="flex items-center">
                <div className="bg-gray-200 rounded-full p-2 mr-3 text-gray-700 transition-transform duration-300 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">จัดการโปรไฟล์</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">แก้ไขข้อมูลส่วนตัวและโปรไฟล์ของคุณ</p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="text-xs text-gray-700 font-medium inline-flex items-center group-hover:translate-x-1 transition-transform duration-300">
                  แก้ไขโปรไฟล์
                  <ChevronRightIcon className="ml-1 h-3 w-3" />
                </span>
              </div>
            </Link>

            {/* เมนูเอกสาร */}
            <Link href="/dashboard/documents" className="group block bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
              <div className="flex items-center">
                <div className="bg-gray-200 rounded-full p-2 mr-3 text-gray-700 transition-transform duration-300 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">จัดการเอกสาร</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">ดูและแก้ไขเอกสารทั้งหมดของคุณ</p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="text-xs text-gray-700 font-medium inline-flex items-center group-hover:translate-x-1 transition-transform duration-300">
                  จัดการเอกสาร
                  <ChevronRightIcon className="ml-1 h-3 w-3" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}