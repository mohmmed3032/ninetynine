'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Search, Menu, X, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient as createBrowserClient } from '@/lib/supabase-browser'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [navLinks, setNavLinks] = useState([
    { href: '/', label: 'الرئيسية' },
    { href: '/clothes', label: 'ملابس نسائية' },
    { href: '/perfumes', label: 'عطور' },
    { href: '/shoes', label: 'أحذية' },
    { href: '/offers', label: 'العروض' },
  ])
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    createBrowserClient()
      .from('categories')
      .select('name, slug, is_main')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) {
          const cats = data
            .filter((c) => c.is_main)
            .map((c) => ({ href: `/${c.slug}`, label: c.name }))
          setNavLinks([
            { href: '/', label: 'الرئيسية' },
            ...cats,
            { href: '/offers', label: 'العروض' },
          ])
        }
      })
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-cream/95 backdrop-blur-md shadow-lg shadow-charcoal/5'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="https://i.ibb.co/tTbKCcRD/logo.jpg" alt="Logo" width={40} height={40} className="rounded-md" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-charcoal tracking-tight">
               The Ninety Nine
              </span>
              <span className="text-xs text-gold -mt-1">عرض فقط</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 gold-underline',
                  pathname === link.href
                    ? 'text-gold bg-gold/10'
                    : 'text-charcoal/70 hover:text-charcoal hover:bg-beige/50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full hover:bg-beige/50 transition-colors text-charcoal/70 hover:text-charcoal"
              aria-label="بحث"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-beige/50 transition-colors text-charcoal/70 hover:text-charcoal"
              aria-label="القائمة"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="pb-4 animate-fade-in">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحثي عن منتج..."
                className="w-full px-5 py-3 pr-12 rounded-xl bg-white border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 text-charcoal placeholder:text-warm-gray"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
            </div>
          </div>
        )}
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-cream/95 backdrop-blur-md border-t border-beige animate-slide-up">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-3 rounded-lg text-base font-medium transition-colors',
                  pathname === link.href
                    ? 'text-gold bg-gold/10'
                    : 'text-charcoal/70 hover:text-charcoal hover:bg-beige/50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}