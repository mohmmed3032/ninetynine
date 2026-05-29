'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductSliderProps {
  images: string[]
  productName: string
}

export default function ProductSlider({ images, productName }: ProductSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-rose-light">
        <Image
          src={images[currentIndex]}
          alt={`${productName} - صورة ${currentIndex + 1}`}
          fill
          className="object-cover transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-gold hover:text-white transition-colors"
              aria-label="الصورة السابقة"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-gold hover:text-white transition-colors"
              aria-label="الصورة التالية"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 mt-4 justify-center">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300',
                currentIndex === index
                  ? 'border-gold shadow-md'
                  : 'border-transparent hover:border-beige'
              )}
            >
              <Image
                src={img}
                alt={`${productName} - مصغرة ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
