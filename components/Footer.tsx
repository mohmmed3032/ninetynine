 'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient as createBrowserClient } from '@/lib/supabase-browser'
import { ShoppingBag, MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react'

const footerLinks = [
  {
    title: 'التصنيفات',
    links: [
      { href: '/clothes', label: 'ملابس نسائية' },
      { href: '/perfumes', label: 'عطور' },
      { href: '/shoes', label: 'أحذية' },
      { href: '/offers', label: 'العروض' },
    ],
  },
  {
    title: 'روابط سريعة',
    links: [
      { href: '/', label: 'الصفحة الرئيسية' },
      { href: '/offers', label: 'الجديد والتخفيضات' },
      { href: '#', label: 'سياسة الخصوصية' },
      { href: '#', label: 'شروط الاستخدام' },
    ],
  },
]

export default function Footer() {
  const [contact, setContact] = useState({
    whatsapp: '218945239468',
    phone: '+218 94-5239468',
    email: 'info@showroom.ly',
    address: 'طرابلس، ليبيا',
    instagram: '#',
    facebook: '#',
    footer_text: 'وجهتك الأولى لأحدث صيحات الموضة والأناقة في ليبيا. نقدم لكِ تشكيلة فريدة من الملابس والعطور والأحذية الفاخرة.',
  })

  useEffect(() => {
    ;(async () => {
      try {
        const client = createBrowserClient()
        const { data } = await client.from('site_settings').select('*').single()
        if (data) {
          setContact((c) => ({ ...c, ...data }))
        }
      } catch (e) {
        // ignore
      }
    })()
  }, [])

  return (
    <footer className="bg-charcoal text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-gold" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">صالة العرض</span>
                <span className="text-xs text-gold -mt-1">عرض فقط</span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              وجهتك الأولى لأحدث صيحات الموضة والأناقة في ليبيا. نقدم لكِ تشكيلة فريدة من الملابس والعطور والأحذية الفاخرة.
            </p>
            <div className="flex gap-3">
              <a
                href={contact.instagram || '#'}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"
                aria-label="إنستغرام"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={contact.facebook || '#'}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"
                aria-label="فيسبوك"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-5 text-gold">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-gold transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-5 text-gold">تواصل معنا</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span className="text-white/60 text-sm">{contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <span className="text-white/60 text-sm" dir="ltr">{contact.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <span className="text-white/60 text-sm">{contact.email}</span>
              </li>
            </ul>
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Phone className="w-4 h-4" />
              تواصل عبر واتساب
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2024 صالة العرض ليبيا. جميع الحقوق محفوظة.
          </p>
          <p className="text-white/40 text-sm">
            الموقع للعرض فقط - لا يوجد نظام طلبات
          </p>
        </div>
      </div>
    </footer>
  )
}
