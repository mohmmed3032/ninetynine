'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Eye } from 'lucide-react'
import { Product } from '@/types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const hasDiscount = product.oldPrice && product.oldPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0

  return (
    <div
      className="group animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-beige/50">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden image-zoom bg-rose-light">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-300" />
            <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
              <button
                className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-rose-light transition-colors"
                onClick={(e) => e.preventDefault()}
                aria-label="المفضلة"
              >
                <Heart className="w-4 h-4 text-charcoal" />
              </button>
              <button
                className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-rose-light transition-colors"
                onClick={(e) => e.preventDefault()}
                aria-label="عرض سريع"
              >
                <Eye className="w-4 h-4 text-charcoal" />
              </button>
            </div>

            {/* Tags */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    tag === 'جديد'
                      ? 'bg-gold text-white'
                      : 'bg-rose text-charcoal'
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Discount Badge */}
            {hasDiscount && (
              <div className="absolute bottom-3 left-3">
                <span className="px-3 py-1 rounded-full bg-charcoal text-white text-xs font-bold">
                  خصم {discountPercent}%
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-xs text-gold font-medium mb-1.5">{product.category}</p>
            <h3 className="text-base font-semibold text-charcoal mb-2 line-clamp-1 group-hover:text-gold transition-colors">
              {product.name}
            </h3>

            {/* Colors Preview */}
            <div className="flex items-center gap-1.5 mb-3">
              {product.colors.slice(0, 4).map((color, i) => (
                <span
                  key={i}
                  className="w-4 h-4 rounded-full border border-beige shadow-sm"
                  style={{
                    backgroundColor:
                      color === 'أسود'
                        ? '#1a1a1a'
                        : color === 'أبيض'
                        ? '#ffffff'
                        : color === 'بيج'
                        ? '#E8DFD0'
                        : color === 'ذهبي'
                        ? '#C9A96E'
                        : color === 'وردي'
                        ? '#F5E6E0'
                        : color === 'وردي فاتح'
                        ? '#FDF2F0'
                        : color === 'رمادي'
                        ? '#9CA3AF'
                        : color === 'نيلي'
                        ? '#1e3a5f'
                        : color === 'أحمر'
                        ? '#DC2626'
                        : color === 'بني'
                        ? '#8B4513'
                        : color === 'أزرق فاتح'
                        ? '#93C5FD'
                        : color === 'أزرق غامق'
                        ? '#1E40AF'
                        : color === 'أخضر زيتوني'
                        ? '#6B7C3E'
                        : color === 'كريمي'
                        ? '#FFFDD0'
                        : '#D1D5DB',
                  }}
                  title={color}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-warm-gray">+{product.colors.length - 4}</span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-charcoal">
                {product.price} د.ل
              </span>
              {hasDiscount && (
                <span className="text-sm text-warm-gray line-through">
                  {product.oldPrice} د.ل
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
