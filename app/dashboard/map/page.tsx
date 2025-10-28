"use client"

import { useState, useEffect } from "react"
import type { CategoryDoc } from "@prisma/client"
import type { DocumentWithCategory } from "@/app/types/document"
import { getCategories } from "@/app/lib/actions/categories/get"
import { getDocuments } from "@/app/lib/actions/documents/get"
import dynamic from "next/dynamic"
import CircleLoader from "./components/CircleLoader"

// Dynamic import for map component
const DynamicMapView = dynamic(() => import("./components/DynamicMapView"), { ssr: false })
const RecentUpdateNotification = dynamic(() => import("./components/RecentUpdateNotification"), { ssr: false })

export default function MapPage() {
  const [categories, setCategories] = useState<CategoryDoc[]>([])
  const [documents, setDocuments] = useState<DocumentWithCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catsData, docsData] = await Promise.all([getCategories(), getDocuments()])

        setCategories(catsData)

        // Sort documents by creation date (newest first)
        const sortedDocs = [...docsData].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )

        // Add metadata to documents
        const docsWithMetadata = sortedDocs.map((doc, index) => ({
          ...doc,
          isLatest: index < 5,
          year: (doc as any).year ?? new Date().getFullYear() + 543,
        }))

        setDocuments(docsWithMetadata)
      } catch (error) {
        console.error("Error loading data:", error)
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <CircleLoader message="กำลังโหลดข้อมูล..." variant="spinner" />
          <p className="mt-4 text-slate-600 font-medium">กำลังเตรียมแผนที่...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-200/50 max-w-md backdrop-blur-sm">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">เกิดข้อผิดพลาด</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-slate-50">
      {/* Full-screen map only */}
      <DynamicMapView
        categories={categories}
        documents={documents}
      />

      {/* Recent Update Notification */}
      <RecentUpdateNotification documents={documents} />
    </div>
  )
}