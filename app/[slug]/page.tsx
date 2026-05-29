'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import ProductGrid from '@/components/ProductGrid'
import FilterBar from '@/components/FilterBar'
import SearchBar from '@/components/SearchBar'
import { getPublicProducts, getCategoriesPublic } from '@/app/admin/actions'
import { Product } from '@/types'

export default function DynamicCategoryPage() {
  const params = useParams()
  const slug = params.slug as string

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categoryName, setCategoryName] = useState('')
  const [loading, setLoading] = useState(true)

  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    Promise.all([getPublicProducts(), getCategoriesPublic()]).then(([products, cats]) => {
      const cat = cats.find((c: any) => c.slug === slug)
      setCategoryName(cat?.name || slug)
      setAllProducts(products.filter((p) => p.category === cat?.name))
      setLoading(false)
    })
  }, [slug])

  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
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
  }, [allProducts, selectedSizes, selectedColors, selectedTag, searchQuery])

  const allSizes = Array.from(new Set(allProducts.flatMap((p) => p.sizes)))
  const allColors = Array.from(new Set(allProducts.flatMap((p) => p.colors)))

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-warm-gray">
        جاري التحميل...
      </div>
    )
  }

  if (!categoryName && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-charcoal mb-2">الفئة غير موجودة</h1>
        <p className="text-warm-gray">الفئة التي تبحثين عنها غير متوفرة</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionTitle title={categoryName} subtitle="تشكيلة مميزة" />
      <SearchBar onSearch={setSearchQuery} initialQuery={searchQuery} />
      <FilterBar
        categories={['الكل', categoryName]}
        sizes={allSizes}
        colors={allColors}
        selectedCategory={categoryName}
        selectedSizes={selectedSizes}
        selectedColors={selectedColors}
        selectedTag={selectedTag}
        onCategoryChange={() => {}}
        onSizesChange={setSelectedSizes}
        onColorsChange={setSelectedColors}
        onTagChange={setSelectedTag}
      />
      <p className="text-sm text-warm-gray mb-4">{filteredProducts.length} منتج</p>
      <ProductGrid products={filteredProducts} emptyMessage="لا توجد منتجات في هذه الفئة" />
    </div>
  )
}