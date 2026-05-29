import Link from 'next/link'
import Image from 'next/image'
import { getCategories } from '@/lib/products'
import { getPublicProducts } from '@/app/admin/actions'
import SectionTitle from '@/components/SectionTitle'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

export default async function CategoriesPage() {
  const categories = await getCategories()
  const products = await getPublicProducts()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionTitle title="جميع الفئات" subtitle="استكشفي تشكيلاتنا" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.category === cat.name)
          const lastProduct = catProducts[catProducts.length - 1]
          const fallbackImage = lastProduct?.images?.[lastProduct.images.length - 1]
          const image = cat.image || fallbackImage || 'https://via.placeholder.com/600x800'
          
          return (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-lg block"
            >
              <Image
                src={image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
              <div className="absolute bottom-0 right-0 left-0 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gold/20 backdrop-blur-sm flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                    <p className="text-sm text-white/70">{catProducts.length} منتجات</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gold text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                  <span>تصفحي التشكيلة</span>
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}