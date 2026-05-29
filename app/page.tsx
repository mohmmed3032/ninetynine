import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Sparkles, Tag, Shirt, Droplets, Footprints, Phone, ShoppingBag } from 'lucide-react'
import HeroBanner from '@/components/HeroBanner'
import SectionTitle from '@/components/SectionTitle'
import ProductCard from '@/components/ProductCard'
import { getNewProducts, getDiscountedProducts, getCategories } from '@/lib/products'
import { getPublicProducts } from '@/app/admin/actions'

const iconMap: Record<string, any> = {
  clothes: Shirt,
  perfumes: Droplets,
  shoes: Footprints,
}

export default async function HomePage() {
  const newProducts = (await getNewProducts()).slice(0, 4)
  const discountedProducts = (await getDiscountedProducts()).slice(0, 4)
  const allCategories = await getCategories()
  const allProducts = await getPublicProducts()

  const mainCategories = allCategories
    .filter((c) => c.is_main)
    .map((cat) => {
      const Icon = iconMap[cat.slug] || ShoppingBag
      const catProducts = allProducts.filter((p) => p.category === cat.name)
      const lastProduct = catProducts[catProducts.length - 1]
      const fallbackImage = lastProduct?.images?.[lastProduct.images.length - 1]
      const image = cat.image || fallbackImage || 'https://via.placeholder.com/600x800'

      return {
        name: cat.name,
        href: `/${cat.slug}`,
        icon: Icon,
        image,
        count: catProducts.length,
      }
    })

  const hasMoreCategories = allCategories.length > 3

  return (
    <div>
      <HeroBanner />

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title="تصنيفاتنا الرئيسية" subtitle="اكتشفي المزيد" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mainCategories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-lg"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
              <div className="absolute bottom-0 right-0 left-0 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gold/20 backdrop-blur-sm flex items-center justify-center">
                    <cat.icon className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                    <p className="text-sm text-white/70">{cat.count} منتجات</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gold text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                  <span>تصفحي التشكيلة</span>
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {hasMoreCategories && (
          <div className="text-center mt-10">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-gold hover:text-gold-dark font-semibold text-lg transition-colors group"
            >
              <span className="border-b-2 border-gold/30 group-hover:border-gold-dark pb-1">عرض المزيد</span>
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        )}
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <SectionTitle title="وصل حديثاً" subtitle="الجديد" centered={false} className="mb-0" />
            <Link href="/offers" className="hidden sm:inline-flex items-center gap-2 text-gold hover:text-gold-dark font-medium transition-colors">
              عرضي الكل <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <SectionTitle title="تخفيضات خاصة" subtitle="لا تفوتي الفرصة" centered={false} className="mb-0" />
          <Link href="/offers" className="hidden sm:inline-flex items-center gap-2 text-gold hover:text-gold-dark font-medium transition-colors">
            عرضي الكل<ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {discountedProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      <section className="py-20 bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">جودة فاخرة</h3>
              <p className="text-white/60">نختار لكِ أفضل المنتجات من أجود الخامات والأقمشة</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">أسعار مميزة</h3>
              <p className="text-white/60">تخفيضات مستمرة وعروض حصرية على تشكيلة واسعة</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">تواصل سهل</h3>
              <p className="text-white/60">تواصلي معنا مباشرة عبر واتساب للاستفسار والتوصية</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}