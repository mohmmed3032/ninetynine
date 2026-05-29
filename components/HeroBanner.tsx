'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function HeroBanner() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const isMobileWidth = typeof window !== 'undefined' && window.innerWidth < 600
    setIsMobile(isMobileWidth)

    const handleResize = () => {
      setIsMobile(window.innerWidth < 600)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={isMobile ? `https://i.ibb.co/CpB3J6m8/Chat-GPT-Image-May-28-2026-05-29-06-AM.png` : `https://i.ibb.co/CpB3J6m8/Chat-GPT-Image-May-28-2026-05-29-06-AM.png`}
          alt="خلفية صالة العرض"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-cream/95 via-cream/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-6">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-gold">مجموعة جديدة 2024</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal leading-tight mb-6">
            أناقة لا تُضاهى
            <span className="block text-gold mt-2">لأجمل إطلالة</span>
          </h1>

          <p className="text-lg text-charcoal/70 leading-relaxed mb-8 max-w-lg">
            اكتشفي تشكيلتنا الفريدة من الملابس النسائية والعطور والأحذية الفاخرة في ليبيا. كل قطعة تروي قصة من الأناقة والرقي.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/clothes"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-white rounded-xl font-semibold hover:bg-gold-dark transition-colors shadow-lg shadow-gold/20"
            >
              تسوقي الآن
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link
              href="/offers"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-charcoal rounded-xl font-semibold hover:bg-rose-light transition-colors border border-beige"
            >
              العروض الخاصة
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex gap-8">
            <div>
              <p className="text-3xl font-bold text-gold">500+</p>
              <p className="text-sm text-charcoal/60 mt-1">منتج فاخر</p>
            </div>
            <div className="w-px bg-beige" />
            <div>
              <p className="text-3xl font-bold text-gold">50+</p>
              <p className="text-sm text-charcoal/60 mt-1">علامة تجارية</p>
            </div>
            <div className="w-px bg-beige" />
            <div>
              <p className="text-3xl font-bold text-gold">1000+</p>
              <p className="text-sm text-charcoal/60 mt-1">عميلة سعيدة</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
