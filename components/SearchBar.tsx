'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  initialQuery?: string
}

export default function SearchBar({ onSearch, initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto mb-10">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحثي عن منتج بالاسم أو الوصف..."
          className="w-full px-5 py-4 pr-14 pl-12 rounded-2xl bg-white border border-beige shadow-sm focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/10 text-charcoal placeholder:text-warm-gray transition-all"
        />
        <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-beige/50 flex items-center justify-center hover:bg-beige transition-colors"
          >
            <X className="w-4 h-4 text-charcoal" />
          </button>
        )}
      </div>
    </form>
  )
}
