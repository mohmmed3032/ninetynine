import Link from 'next/link'
import { Home, SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-24 h-24 rounded-full bg-beige/50 flex items-center justify-center mx-auto mb-6">
          <SearchX className="w-12 h-12 text-gold" />
        </div>
        <h1 className="text-4xl font-bold text-charcoal mb-3">الصفحة غير موجودة</h1>
        <p className="text-warm-gray mb-8 max-w-md mx-auto">
          عذراً، الصفحة التي تبحثين عنها غير متوفرة. ربما تم نقلها أو حذفها.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-white rounded-xl font-semibold hover:bg-gold-dark transition-colors"
        >
          <Home className="w-5 h-5" />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}
