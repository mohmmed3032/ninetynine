'use client'

import { useState, useMemo, useEffect } from 'react'
import SectionTitle from '@/components/SectionTitle'
import ProductGrid from '@/components/ProductGrid'
import FilterBar from '@/components/FilterBar'
import SearchBar from '@/components/SearchBar'
import { getPublicProducts } from '@/app/admin/actions'
import { Product } from '@/types'

export default function OffersPage() {
  const [allOffers, setAllOffers] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState('الكل')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    getPublicProducts().then((products) => {
      setAllOffers(products.filter((p) => p.tags.includes('جديد') || p.tags.includes('تخفيض')))
      setLoading(false)
    })
  }, [])

  const filteredProducts = useMemo(() => {
    let filtered = [...allOffers]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }

    if (selectedCategory !== 'الكل') {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)))
    }

    if (selectedColors.length > 0) {
      filtered = filtered.filter((p) => p.colors.some((c) => selectedColors.includes(c)))
    }

    if (selectedTag) {
      filtered = filtered.filter((p) => p.tags.includes(selectedTag))
    }

    return filtered
  }, [allOffers, selectedCategory, selectedSizes, selectedColors, selectedTag, searchQuery])

  const allSizes = Array.from(new Set(allOffers.flatMap((p) => p.sizes)))
  const allColors = Array.from(new Set(allOffers.flatMap((p) => p.colors)))
  const allCategories = Array.from(new Set(allOffers.map((p) => p.category)))

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-warm-gray">
        جاري التحميل...
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionTitle title="العروض والجديد" subtitle="لا تفوتي الفرصة" />
      <SearchBar onSearch={setSearchQuery} initialQuery={searchQuery} />
      <FilterBar
        categories={['الكل', ...allCategories]}
        sizes={allSizes}
        colors={allColors}
        selectedCategory={selectedCategory}
        selectedSizes={selectedSizes}
        selectedColors={selectedColors}
        selectedTag={selectedTag}
        onCategoryChange={setSelectedCategory}
        onSizesChange={setSelectedSizes}
        onColorsChange={setSelectedColors}
        onTagChange={setSelectedTag}
      />
      <p className="text-sm text-warm-gray mb-4">{filteredProducts.length} منتج</p>
      <ProductGrid products={filteredProducts} emptyMessage="لا توجد عروض تطابق الفلاتر المحددة" />
    </div>
  )
}