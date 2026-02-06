// components/SearchForm.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

interface Category {
  id: number
  name: string
}

interface SearchFormProps {
  defaultSearch: string
  defaultCategory?: number
  categories: Category[]
}

export default function SearchForm({ defaultSearch, defaultCategory, categories }: SearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [search, setSearch] = useState(defaultSearch)
  const [categoryId, setCategoryId] = useState(defaultCategory?.toString() || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    startTransition(() => {
      const params = new URLSearchParams()
      
      if (search.trim()) {
        params.set('search', search.trim())
      }
      
      if (categoryId) {
        params.set('category', categoryId)
      }
      
      // Reset to page 1 when searching
      params.set('page', '1')
      
      const queryString = params.toString()
      router.push(queryString ? `?${queryString}` : window.location.pathname)
    })
  }

  const handleReset = () => {
    setSearch('')
    setCategoryId('')
    router.push(window.location.pathname)
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50 p-4 mb-6">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาเอกสาร..."
                            className="w-full px-3 py-2 text-sm font-light border border-slate-200 rounded-lg bg-white/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-100 transition-all"
            disabled={isPending}
          />
        </div>
        
        <div className="w-48">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 text-sm font-light border border-slate-200 rounded-lg bg-white/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-100 transition-all"
            disabled={isPending}
          >
            <option value="">ทุกประเภท</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-slate-900 text-white text-sm font-light rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              <span>ค้นหา...</span>
            </div>
          ) : (
            'ค้นหา'
          )}
        </button>
        
        {(search || categoryId) && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-slate-600 text-sm font-light border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            ล้าง
          </button>
        )}
      </form>
    </div>
  )
}