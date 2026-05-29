import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Package, Shield } from 'lucide-react'
import { getProductById, getAllProducts, getCategories } from '@/lib/products'
import ProductSlider from '@/components/ProductSlider'
import WhatsAppButton from '@/components/WhatsAppButton'
import ProductCard from '@/components/ProductCard'

interface ProductPageProps {
  params: { id: string }
}

// Allow ANY product ID to render on-demand, not just those generated at build time
export const dynamicParams = true
export const revalidate = 0

export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map((product) => ({ id: product.id }))
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  const hasDiscount = product.oldPrice && product.oldPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0

  const isPerfume = product.category === 'عطور'
  const isShoes = product.category === 'أحذية'

  const categories = await getCategories()
  const category = categories.find((c) => c.name === product.category)
  const categoryHref = category ? `/${category.slug}` : '/'

  const relatedProducts = (await getAllProducts())
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return (
    <div>
      <div className="bg-white border-b border-beige/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-warm-gray hover:text-gold transition-colors">الرئيسية</Link>
            <ArrowRight className="w-4 h-4 text-warm-gray" />
            <Link href={categoryHref} className="text-warm-gray hover:text-gold transition-colors">
              {product.category}
            </Link>
            <ArrowRight className="w-4 h-4 text-warm-gray" />
            <span className="text-charcoal font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <ProductSlider images={product.images} productName={product.name} />
          </div>

          <div className="flex flex-col">
            <div className="flex gap-2 mb-4">
              {product.tags.map((tag) => (
                <span key={tag} className={`px-3 py-1 rounded-full text-xs font-semibold ${tag === 'جديد' ? 'bg-gold text-white' : 'bg-rose text-charcoal'}`}>
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">{product.name}</h1>
            <p className="text-sm text-gold font-medium mb-4">{product.category}</p>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-charcoal">{product.price} د.ل</span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-warm-gray line-through">{product.oldPrice} د.ل</span>
                  <span className="px-3 py-1 rounded-full bg-rose text-charcoal text-sm font-bold">خصم {discountPercent}%</span>
                </>
              )}
            </div>

            <p className="text-charcoal/70 leading-relaxed mb-8 text-base">{product.description}</p>

            {!isPerfume && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-charcoal mb-3">الألوان المتوفرة</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <div key={color} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cream border border-beige">
                      <span className="w-5 h-5 rounded-full border border-beige shadow-sm" style={{ backgroundColor: getColorHex(color) }} />
                      <span className="text-sm text-charcoal">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-charcoal mb-3">
                {isPerfume ? 'أحجام العبوة المتوفرة' : isShoes ? 'المقاسات المتوفرة' : 'المقاسات المتوفرة'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span key={size} className="px-4 py-2 rounded-xl bg-cream border border-beige text-sm font-medium text-charcoal">{size}</span>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <WhatsAppButton productName={product.name} productPrice={product.price} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-cream border border-beige/50">
                <Package className="w-5 h-5 text-gold shrink-0" />
                <div>
                  <p className="text-sm font-medium text-charcoal">منتج أصلي</p>
                  <p className="text-xs text-warm-gray">جودة مضمونة 100%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-cream border border-beige/50">
                <Shield className="w-5 h-5 text-gold shrink-0" />
                <div>
                  <p className="text-sm font-medium text-charcoal">استبدال سهل</p>
                  <p className="text-xs text-warm-gray">خلال 14 يوم</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="bg-white border-t border-beige/50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-charcoal mb-8">منتجات مشابهة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getColorHex(color: string): string {
  const map: Record<string, string> = {
    'أسود': '#1a1a1a', 'أبيض': '#ffffff', 'بيج': '#E8DFD0', 'ذهبي': '#C9A96E',
    'وردي': '#F5E6E0', 'وردي فاتح': '#FDF2F0', 'رمادي': '#9CA3AF', 'نيلي': '#1e3a5f',
    'أحمر': '#DC2626', 'بني': '#8B4513', 'أزرق فاتح': '#93C5FD', 'أزرق غامق': '#1E40AF',
    'أخضر زيتوني': '#6B7C3E', 'كريمي': '#FFFDD0',
  }
  return map[color] || '#D1D5DB'
}