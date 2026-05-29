'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getPublicProducts, getCategoriesPublic } from '@/app/admin/actions'
import { Product } from '@/types'
import SectionTitle from '@/components/SectionTitle'
import { ArrowLeft, ShoppingBag, Layers, ImageOff } from 'lucide-react'

interface CategoryItem {
  id: string
  name: string
  slug: string
  image?: string
  is_main: boolean
  productCount: number
  fallbackImage?: string
}

function SkeletonCard() {
  return (
    <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-cream border border-beige/50 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
      <div className="absolute bottom-0 right-0 left-0 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-white/20" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-white/20 rounded" />
            <div className="h-3 w-20 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [cats, products] = await Promise.all([
        getCategoriesPublic(),
        getPublicProducts(),
      ])

      const enriched: CategoryItem[] = cats.map((cat: any) => {
        const catProducts = products.filter((p: Product) => p.category === cat.name)
        const lastProduct = catProducts[catProducts.length - 1]
        const fallbackImage = lastProduct?.images?.[lastProduct.images.length - 1]

        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image || undefined,
          is_main: cat.is_main,
          productCount: catProducts.length,
          fallbackImage: fallbackImage || undefined,
        }
      })

      setCategories(enriched)
    } catch (e) {
      console.error('Categories load error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionTitle title="جميع الفئات" subtitle="استكشفي تشكيلاتنا" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          categories.map((cat) => {
            const displayImage = cat.image || cat.fallbackImage
            const hasImage = !!displayImage

            return (
              <Link
                key={cat.id}
                href={`/${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-lg block"
              >
                {hasImage ? (
                  <Image
                    src={displayImage}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-beige to-sand flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <ImageOff className="w-10 h-10 text-gold/70" />
                      </div>
                      <p className="text-sm font-medium text-charcoal/50">لا توجد صورة</p>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />

                <div className="absolute bottom-0 right-0 left-0 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gold/20 backdrop-blur-sm flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                      <p className="text-sm text-white/70">
                        {cat.productCount > 0 ? `${cat.productCount} منتجات` : 'لا توجد منتجات'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gold text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                    <span>تصفحي التشكيلة</span>
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {!loading && categories.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-beige/50 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-10 h-10 text-gold" />
          </div>
          <h3 className="text-lg font-bold text-charcoal mb-1">لا توجد فئات</h3>
          <p className="text-warm-gray text-sm">أضيفي فئات جديدة من لوحة التحكم</p>
        </div>
      )}
    </div>
  )
}
