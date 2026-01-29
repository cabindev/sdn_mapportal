// app/dashboard/documents/page.tsx
import Link from "next/link"
import { PlusIcon, DocumentIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { Suspense } from "react"
import { searchDocuments } from "@/app/lib/actions/documents/search"
import { getCategories } from "@/app/lib/actions/categories/get"
import DocumentTable from "./components/DocumentTable"
import SearchForm from "./components/SearchForm"
import PaginationControls from "./components/PaginationControls"
import type { DocumentWithCategory } from "@/app/types/document"
import type { CategoryDoc } from "@prisma/client"

const ITEMS_PER_PAGE = 20

interface PageProps {
  searchParams?: Promise<{
    page?: string
    search?: string
    category?: string
  }>
}

interface DocumentStats {
  all: number
  published: number
  unpublished: number
}

// Loading Component
function DocumentsLoading() {
  return (
    <div className="p-12 text-center">
      <div className="inline-flex items-center space-x-2 text-slate-500">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin"></div>
        <span className="text-sm font-medium">กำลังโหลดข้อมูล...</span>
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="p-16 text-center">
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
        <DocumentIcon className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {hasFilters ? "ไม่พบเอกสารที่ตรงตามเงื่อนไข" : "ยังไม่มีเอกสารในระบบ"}
      </h3>
      <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
        {hasFilters 
          ? "ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองเพื่อค้นหาเอกสารที่ต้องการ"
          : "เริ่มต้นโดยการเพิ่มเอกสารแรกของคุณเข้าสู่ระบบ"
        }
      </p>
      <div className="flex items-center justify-center space-x-3">
        {hasFilters && (
          <Link
            href="/dashboard/documents"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            ล้างตัวกรอง
          </Link>
        )}
        <Link
          href="/dashboard/documents/new"
          className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          เพิ่มเอกสารใหม่
        </Link>
      </div>
    </div>
  )
}

// Stats Component
function DocumentStatsCards({ stats }: { stats: DocumentStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-xl border border-slate-200/50 p-6 shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-slate-100 rounded-lg">
            <DocumentIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-600">เอกสารทั้งหมด</p>
            <p className="text-2xl font-bold text-slate-900">{stats.all.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200/50 p-6 shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <EyeIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-600">เผยแพร่แล้ว</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.published.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200/50 p-6 shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-amber-100 rounded-lg">
            <EyeSlashIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-600">ไม่เผยแพร่</p>
            <p className="text-2xl font-bold text-amber-600">{stats.unpublished.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function DocumentsPage({ searchParams }: PageProps) {
  // Get search parameters
  const params = searchParams ? await searchParams : {}
  const currentPage = Number(params?.page) || 1
  const search = params?.search || ""
  const categoryId = params?.category ? parseInt(params.category) : undefined

  // Fetch data
  const [searchResult, categories] = await Promise.all([
    searchDocuments({
      search,
      categoryId,
      page: currentPage,
      limit: ITEMS_PER_PAGE
    }),
    getCategories()
  ])

  const { documents: serializedDocuments, pagination, stats } = searchResult
  const { totalPages, totalItems: totalDocuments } = pagination
  const hasFilters = Boolean(search || categoryId)

  // ลบฟังก์ชัน getPageUrl ออก เพราะจะทำใน PaginationControls แทน

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">การจัดการเอกสาร</h1>
            <p className="mt-1 text-sm text-slate-600">
              จัดการและควบคุมเอกสารทั้งหมดในระบบ
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/dashboard/documents/new"
              className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              เพิ่มเอกสารใหม่
            </Link>
          </div>
        </div>

        {/* Stats */}
        <DocumentStatsCards stats={stats} />

        {/* Search and Filters */}
        <div className="mb-6">
          <SearchForm 
            defaultSearch={search}
            defaultCategory={categoryId}
            categories={categories}
          />
        </div>

        {/* Results Info */}
        {hasFilters && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              พบ <span className="font-medium text-slate-900">{totalDocuments.toLocaleString()}</span> เอกสาร
              {search && <span> สำหรับ "{search}"</span>}
              {categoryId && (
                <span> ในหมวดหมู่ "{categories.find(c => c.id === categoryId)?.name}"</span>
              )}
            </p>
            <Link
              href="/dashboard/documents"
              className="text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              ล้างตัวกรอง
            </Link>
          </div>
        )}

        {/* Documents Table */}
        <div className="bg-white rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
          <Suspense fallback={<DocumentsLoading />}>
            {serializedDocuments.length > 0 ? (
              <>
                <DocumentTable documents={serializedDocuments} />
                
                {/* Pagination - ลบ getPageUrl prop ออก */}
                {totalPages > 1 && (
                  <div className="border-t border-slate-200/50">
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalDocuments={totalDocuments}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </div>
                )}
              </>
            ) : (
              <EmptyState hasFilters={hasFilters} />
            )}
          </Suspense>
        </div>

        {/* Quick Actions */}
        {serializedDocuments.length > 0 && (
          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="text-sm text-slate-500">
              การดำเนินการอื่น ๆ:
            </div>
            <Link
              href="/dashboard/documents/bulk-upload"
              className="text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              อัปโหลดหลายไฟล์
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/dashboard/documents/export"
              className="text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              ส่งออกข้อมูล
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/dashboard/categories"
              className="text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              จัดการหมวดหมู่
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// Enable dynamic rendering
export const dynamic = "force-dynamic"