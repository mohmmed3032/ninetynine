'use client'

import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'
import { createClient as createBrowserClient } from '@/lib/supabase-browser'

interface WhatsAppButtonProps {
  productName: string
  productPrice: number
}

export default function WhatsAppButton({ productName, productPrice }: WhatsAppButtonProps) {
  const [whatsapp, setWhatsapp] = useState('218945239468')

  useEffect(() => {
    ;(async () => {
      try {
        const client = createBrowserClient()
        const { data } = await client.from('site_settings').select('whatsapp').single()
        if (data?.whatsapp) setWhatsapp(data.whatsapp)
      } catch (e) {
        // ignore
      }
    })()
  }, [])

  const message = `مرحباً، أنا مهتمة بمنتج: ${productName} (السعر: ${productPrice} د.ل) - هل يمكنني معرفة المزيد من التفاصيل؟`
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodedMessage}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-green-600/20 hover:shadow-xl hover:shadow-green-600/30"
    >
      <Phone className="w-5 h-5" />
      <span>تواصلي عبر واتساب للاستفسار</span>
    </a>
  )
}
