// app/dashboard/documents/page.tsx
import Link from "next/link";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Suspense } from "react";
import DocumentList from "../components/documents/DocumentList";
import { searchDocuments } from "@/app/lib/actions/documents/search";
import { deleteDocument } from "@/app/lib/actions/documents/delete";
import { getCategories } from "@/app/lib/actions/categories/get"; // เพิ่มการนำเข้า

// ระบุจำนวนรายการต่อหน้า
const ITEMS_PER_PAGE = 10;

// แก้ไขประเภทข้อมูลของ searchParams ให้เป็น Promise
export default async function DocumentsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    search?: string;
    category?: string;
  }>;
}) {
  // รับค่า query parameters โดยใช้ await ตามข้อกำหนดของ Next.js 15
  const params = searchParams ? await searchParams : {};
  const currentPage = Number(params?.page) || 1;
  const search = params?.search || "";
  const categoryId = params?.category ? parseInt(params.category) : undefined;

  // ดึงข้อมูลหมวดหมู่และเอกสารพร้อมกัน
  const [{ documents: serializedDocuments, pagination, stats: totalStats }, categories] = await Promise.all([
    searchDocuments({
      search,
      categoryId,
      page: currentPage,
      limit: ITEMS_PER_PAGE
    }),
    getCategories() // ดึงข้อมูลหมวดหมู่
  ]);

  // ข้อมูลสำหรับ pagination
  const { totalPages, totalItems: totalDocuments } = pagination;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  // สร้าง URL สำหรับ pagination
  function getPageUrl(page: number) {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    
    if (search) {
      params.set('search', search);
    }
    
    if (categoryId) {
      params.set('category', categoryId.toString());
    }
    
    return `?${params.toString()}`;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* ส่วนอื่นๆ ของโค้ดคงเดิม */}
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">เอกสารทั้งหมด</h1>
            <p className="text-gray-600 mt-1">
              จัดการเอกสารและข้อมูลในระบบ
            </p>
          </div>
          <Link
            href="/dashboard/documents/new"
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            เพิ่มเอกสารใหม่
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-gray-500">เอกสารทั้งหมด</div>
            <div className="text-2xl font-semibold">{totalStats.all}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-gray-500">เอกสารที่เผยแพร่</div>
            <div className="text-2xl font-semibold">{totalStats.published}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-gray-500">เอกสารที่ไม่เผยแพร่</div>
            <div className="text-2xl font-semibold">{totalStats.unpublished}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Form */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <form className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              ค้นหา
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                name="search"
                defaultValue={search}
                placeholder="ค้นหาตามชื่อหรือคำอธิบาย..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50"
              />
            </div>
          </div>
          
          <div className="w-full md:w-64">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              ประเภทงาน
            </label>
            <select
              id="category"
              name="category"
              defaultValue={categoryId ?? ''}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50"
            >
              <option value="">ทุกประเภทงาน</option>
              {/* แสดงรายการหมวดหมู่ที่ดึงมาจากฐานข้อมูล */}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="self-end">
            <button
              type="submit"
              className="w-full md:w-auto px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              ค้นหา
            </button>
          </div>
        </form>
      </div>

      {/* Document List Section */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <Suspense fallback={<div className="p-8 text-center">กำลังโหลดข้อมูล...</div>}>
          {serializedDocuments.length > 0 ? (
            <>
              <DocumentList 
                documents={serializedDocuments} 
                deleteAction={deleteDocument}
                key={`document-list-${search}-${categoryId}-${currentPage}`}
              />
              
              {/* Pagination */}
              {/* คงโค้ดส่วน Pagination ไว้เหมือนเดิม */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                  {/* ... โค้ด pagination ... */}
                  <div className="flex flex-1 justify-between sm:hidden">
                    {hasPrevPage ? (
                      <Link
                        href={getPageUrl(currentPage - 1)}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        ก่อนหน้า
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-500 opacity-50 cursor-not-allowed"
                      >
                        ก่อนหน้า
                      </button>
                    )}
                    
                    {hasNextPage ? (
                      <Link
                        href={getPageUrl(currentPage + 1)}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        ถัดไป
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-500 opacity-50 cursor-not-allowed"
                      >
                        ถัดไป
                      </button>
                    )}
                  </div>
                  
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        แสดง <span className="font-medium">{skip + 1}</span> ถึง{" "}
                        <span className="font-medium">
                          {Math.min(skip + ITEMS_PER_PAGE, totalDocuments)}
                        </span>{" "}
                        จากทั้งหมด <span className="font-medium">{totalDocuments}</span> รายการ
                      </p>
                    </div>
                    
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        {/* ปุ่มไปหน้าก่อนหน้า */}
                        {hasPrevPage ? (
                          <Link
                            href={getPageUrl(currentPage - 1)}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                          >
                            <span className="sr-only">ก่อนหน้า</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-300 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 cursor-not-allowed"
                          >
                            <span className="sr-only">ก่อนหน้า</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        )}
                        
                        {/* หมายเลขหน้า */}
                        {Array.from({ length: totalPages }).map((_, i) => {
                          const pageNumber = i + 1;
                          const isCurrentPage = pageNumber === currentPage;
                          
                          // แสดงเฉพาะหน้าปัจจุบัน, หน้าแรก, หน้าสุดท้าย และหน้าที่อยู่ใกล้เคียงหน้าปัจจุบัน
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            Math.abs(pageNumber - currentPage) <= 1
                          ) {
                            return (
                              <Link
                                key={pageNumber}
                                href={getPageUrl(pageNumber)}
                                aria-current={isCurrentPage ? "page" : undefined}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                  isCurrentPage
                                    ? "z-10 bg-orange-500 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                                    : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                }`}
                              >
                                {pageNumber}
                              </Link>
                            );
                          }
                          
                          // แสดงจุดไข่ปลาสำหรับช่องว่างระหว่างหน้า
                          if (
                            (pageNumber === 2 && currentPage > 3) ||
                            (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                          ) {
                            return (
                              <span
                                key={pageNumber}
                                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                              >
                                ...
                              </span>
                            );
                          }
                          
                          return null;
                        })}
                        
                        {/* ปุ่มไปหน้าถัดไป */}
                        {hasNextPage ? (
                          <Link
                            href={getPageUrl(currentPage + 1)}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                          >
                            <span className="sr-only">ถัดไป</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-300 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 cursor-not-allowed"
                          >
                            <span className="sr-only">ถัดไป</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        )}
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">
                {search || categoryId
                  ? "ไม่พบเอกสารที่ตรงตามเงื่อนไขการค้นหา"
                  : "ยังไม่มีเอกสารในระบบ"}
              </p>
              <Link
                href="/dashboard/documents/new"
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                เพิ่มเอกสารใหม่
              </Link>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}

// ทำให้เว็บไซต์โหลดข้อมูลใหม่เสมอ ไม่ใช้ cache
export const dynamic = "force-dynamic";