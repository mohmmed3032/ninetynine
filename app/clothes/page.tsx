'use client'

import { useState, useMemo, useEffect } from 'react'
import SectionTitle from '@/components/SectionTitle'
import ProductGrid from '@/components/ProductGrid'
import FilterBar from '@/components/FilterBar'
import SearchBar from '@/components/SearchBar'
import { getPublicProducts } from '@/app/admin/actions'
import { Product } from '@/types'

export default function ClothesPage() {
  const [allClothes, setAllClothes] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState('ملابس نسائية')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    getPublicProducts().then((products) => {
      setAllClothes(products.filter((p) => p.category === 'ملابس نسائية'))
      setLoading(false)
    })
  }, [])

  const filteredProducts = useMemo(() => {
    let filtered = [...allClothes]

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
  }, [allClothes, selectedCategory, selectedSizes, selectedColors, selectedTag, searchQuery])

  const allSizes = Array.from(new Set(allClothes.flatMap((p) => p.sizes)))
  const allColors = Array.from(new Set(allClothes.flatMap((p) => p.colors)))

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-warm-gray">
        جاري التحميل...
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionTitle title="ملابس نسائية" subtitle="تشكيلة أنيقة" />
      <SearchBar onSearch={setSearchQuery} initialQuery={searchQuery} />
      <FilterBar
        categories={['الكل', 'ملابس نسائية']}
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
      <ProductGrid products={filteredProducts} emptyMessage="لا توجد ملابس تطابق الفلاتر المحددة" />
    </div>
  )
}