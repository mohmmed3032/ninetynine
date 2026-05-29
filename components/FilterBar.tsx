'use client'

import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  categories: string[]
  sizes: string[]
  colors: string[]
  selectedCategory: string
  selectedSizes: string[]
  selectedColors: string[]
  selectedTag: string
  onCategoryChange: (category: string) => void
  onSizesChange: (sizes: string[]) => void
  onColorsChange: (colors: string[]) => void
  onTagChange: (tag: string) => void
}

export default function FilterBar({
  categories,
  sizes,
  colors,
  selectedCategory,
  selectedSizes,
  selectedColors,
  selectedTag,
  onCategoryChange,
  onSizesChange,
  onColorsChange,
  onTagChange,
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSize = (size: string) => {
    onSizesChange(
      selectedSizes.includes(size)
        ? selectedSizes.filter((s) => s !== size)
        : [...selectedSizes, size]
    )
  }

  const toggleColor = (color: string) => {
    onColorsChange(
      selectedColors.includes(color)
        ? selectedColors.filter((c) => c !== color)
        : [...selectedColors, color]
    )
  }

  const hasActiveFilters =
    selectedCategory !== 'الكل' ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedTag !== ''

  const clearFilters = () => {
    onCategoryChange('الكل')
    onSizesChange([])
    onColorsChange([])
    onTagChange('')
  }

  return (
    <div className="mb-8">
      {/* Mobile Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors',
            isOpen
              ? 'bg-gold text-white border-gold'
              : 'bg-white text-charcoal border-beige hover:border-gold'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-medium">الفلاتر</span>
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-rose text-charcoal text-xs flex items-center justify-center font-bold">
              {selectedSizes.length + selectedColors.length + (selectedCategory !== 'الكل' ? 1 : 0) + (selectedTag ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div
        className={cn(
          'bg-white rounded-2xl border border-beige/50 p-5 shadow-sm',
          !isOpen && 'hidden lg:block'
        )}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-charcoal">تصفية النتائج</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gold hover:text-gold-dark flex items-center gap-1 transition-colors"
            >
              <X className="w-4 h-4" />
              مسح الكل
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Category */}
          <div>
            <h4 className="text-sm font-medium text-charcoal mb-3">الفئة</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-all border',
                    selectedCategory === cat
                      ? 'bg-gold text-white border-gold'
                      : 'bg-cream text-charcoal/70 border-beige hover:border-gold/50'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h4 className="text-sm font-medium text-charcoal mb-3">المقاسات</h4>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={cn(
                    'w-10 h-10 rounded-lg text-sm font-medium transition-all border flex items-center justify-center',
                    selectedSizes.includes(size)
                      ? 'bg-gold text-white border-gold'
                      : 'bg-cream text-charcoal/70 border-beige hover:border-gold/50'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h4 className="text-sm font-medium text-charcoal mb-3">الألوان</h4>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all border',
                    selectedColors.includes(color)
                      ? 'bg-gold/10 border-gold text-charcoal'
                      : 'bg-cream border-beige text-charcoal/70 hover:border-gold/50'
                  )}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-beige"
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
                  />
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-sm font-medium text-charcoal mb-3">الوسوم</h4>
            <div className="flex flex-wrap gap-2">
              {['جديد', 'تخفيض'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagChange(selectedTag === tag ? '' : tag)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-all border',
                    selectedTag === tag
                      ? tag === 'جديد'
                        ? 'bg-gold text-white border-gold'
                        : 'bg-rose text-charcoal border-rose'
                      : 'bg-cream text-charcoal/70 border-beige hover:border-gold/50'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
